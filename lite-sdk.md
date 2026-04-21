# Hosted Fields SDK — Developer Guide

A PCI-compliant SDK for embedding secure hosted payment fields into a checkout experience.
Card data is captured inside cross-origin iframes — your page never touches raw card numbers.

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Initialization](#initialization)
4. [Environments](#environments)
5. [Card Fields](#card-fields)
6. [Payment Buttons](#payment-buttons)
   - [Apple Pay](#apple-pay)
   - [Samsung Pay](#samsung-pay)
7. [Making a Payment](#making-a-payment)
8. [Stored Instruments](#stored-instruments)
9. [Session Data](#session-data)
10. [Cleanup](#cleanup)
11. [Type Reference](#type-reference)
12. [Events Reference](#events-reference)

---

## Installation

```bash
npm install @litenpm/hosted-fields-sdk
```

---

## Quick Start

```ts
import Lite, { Environment, PaymentOperationStatus } from '@litenpm/hosted-fields-sdk';

// 1. Initialize with the JWT session secret
const lite = await Lite.init({
  secret: '<jwt-session-token>',
  environment: Environment.PRODUCTION,
});

// 2. Mount card fields
const elements = lite.elements();
elements.create('cardholderName').mount('#cardholder-name');
elements.create('cardNumber').mount('#card-number');
elements.create('expiry').mount('#expiry');
elements.create('cvv').mount('#cvv');

// 3. Pay on form submit
const result = await lite.pay({ payment_method: 'card' });

if (result.status === PaymentOperationStatus.SUCCESS) {
  console.log('Payment successful');
} else {
  console.error('Payment failed');
}
```

---

## Initialization

```ts
const lite = await Lite.init(config: InitConfig): Promise<Lite>
```

`Lite.init` is the only way to create an SDK instance — it is asynchronous and returns a singleton.
Calling it twice replaces the existing singleton.

### `InitConfig`

| Property | Type | Required | Description |
|---|---|---|---|
| `secret` | `string` | Yes | A JWT issued by the Lite backend encoding the session, merchant, order, amount, and currency |
| `environment` | `Environment` | No | Defaults to `DEVELOPMENT` if omitted |

On initialization the SDK:
1. Decodes the JWT to extract `sessionId` and `merchantId`.
2. Configures all API and iframe resource URLs for the target environment.
3. Fetches the checkout session from the Lite API.

---

## Environments

```ts
import { Environment } from '@litenpm/hosted-fields-sdk';
```

| Value | API Base URL | Use case |
|---|---|---|
| `Environment.PRODUCTION` | `https://lite.sa` | Live transactions |
| `Environment.STAGING` | `https://staging.lite.sa` | Pre-production testing |
| `Environment.DEVELOPMENT` | `https://dev.lite.sa` | Development and QA |
| `Environment.LOCAL` | `https://dev.lite.sa` | Local development (iframe served from `localhost:3001`) |

---

## Card Fields

Card fields are rendered as secure iframes — one per field. They communicate with a hidden
"collect" aggregator iframe via the MessageChannel API. Your page only sees validation state,
never raw card data.

### Creating and mounting fields

```ts
const elements = lite.elements();

const cardNumberField = elements.create('cardNumber');
cardNumberField.mount('#card-number-container');
```

`create` accepts one of: `'cardholderName'`, `'cardNumber'`, `'expiry'`, `'cvv'`.

`mount` takes a CSS selector string pointing to an existing DOM element. The iframe is injected
as a child of that element. Mounting the first card field also bootstraps the hidden collect
aggregator.

### Listening to field validation state

```ts
cardNumberField.on('change', (state: FieldState) => {
  console.log('cardNumber valid:', state.valid);
});
```

`FieldState`:

```ts
interface FieldState {
  valid: boolean;
}
```

The `change` event fires each time the validation state of the field changes (e.g., when the
user types a complete, valid card number, or when they clear the field).

### Full card form example

```html
<div id="cardholder-name"></div>
<div id="card-number"></div>
<div id="expiry"></div>
<div id="cvv"></div>
<button id="pay-btn" disabled>Pay</button>
```

```ts
const elements = lite.elements();

const fields = {
  cardholderName: elements.create('cardholderName'),
  cardNumber: elements.create('cardNumber'),
  expiry: elements.create('expiry'),
  cvv: elements.create('cvv'),
};

const validity: Record<string, boolean> = {};

for (const [name, field] of Object.entries(fields)) {
  field.mount(`#${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
  field.on('change', (state) => {
    validity[name] = state.valid;
    const allValid = Object.values(validity).every(Boolean);
    document.getElementById('pay-btn')!.toggleAttribute('disabled', !allValid);
  });
}
```

---

## Payment Buttons

### Apple Pay

```ts
const applePayButton = lite.elements().create('applePay');
applePayButton.mount('#apple-pay-container');

applePayButton.on('result', (result: PaymentPollingResult) => {
  if (result.status === PaymentOperationStatus.SUCCESS) {
    window.location.href = '/success';
  } else {
    console.error('Apple Pay failed');
  }
});
```

Mounting the button injects an `<apple-pay-button>` web component and loads the Apple Pay SDK
script. The button only renders if the browser supports Apple Pay. The `result` event fires
once the Apple Pay sheet closes and the payment completes or fails.

**Cleanup:**

```ts
applePayButton.destroy();
```

### Samsung Pay

```ts
const samsungPayButton = lite.elements().create('samsungPay');
samsungPayButton.mount('#samsung-pay-container');
```

The button automatically checks `SamsungPay.isReadyToPay()` before rendering. If Samsung Pay
is unavailable in the current browser, the button is not shown.

---

## Making a Payment

```ts
const result = await lite.pay(options: PayParams): Promise<PaymentPollingResult>
```

### `PayParams`

Pay with a payment method:

```ts
await lite.pay({
  payment_method: 'card',       // 'card' | 'applePay' | 'samsungPay' | 'googlePay'
  store_for_future: true,       // optional — save as a stored instrument
});
```

Pay with a previously stored instrument:

```ts
await lite.pay({
  instrument_id: 'inst_xxxx',
});
```

### `PaymentPollingResult`

```ts
interface PaymentPollingResult {
  status: PaymentOperationStatus;
  // ... additional payment details
}
```

### `PaymentOperationStatus`

```ts
import { PaymentOperationStatus } from '@litenpm/hosted-fields-sdk';

PaymentOperationStatus.SUCCESS    // Payment authorized/captured
PaymentOperationStatus.FAILURE    // Payment declined or errored
PaymentOperationStatus.PROCESSING // Payment is still in progress (polling)
```

### Handling 3DS

3D Secure challenges are handled automatically by `lite.pay()`. When a redirect is required,
the SDK opens a modal, completes authentication, and then continues polling — the caller simply
awaits the final `PaymentPollingResult`.

### Full pay example

```ts
try {
  const result = await lite.pay({
    payment_method: 'card',
    store_for_future: false,
  });

  switch (result.status) {
    case PaymentOperationStatus.SUCCESS:
      navigate('/results?status=success');
      break;
    case PaymentOperationStatus.FAILURE:
      showError('Your payment could not be processed. Please try again.');
      break;
  }
} catch (err) {
  showError('An unexpected error occurred.');
}
```

---

## Stored Instruments

After a successful payment with `store_for_future: true`, the card is saved as a stored
instrument. Retrieve them for a returning customer:

```ts
import { PaymentMethod } from '@litenpm/hosted-fields-sdk';

const instruments = lite.getStoredInstruments('card');
```

### `StoredInstrument`

```ts
interface StoredInstrument {
  id: string;
  payment_method: PaymentMethodType;
  holder_type: string;
  display: {
    scheme: string;       // e.g. 'visa', 'mastercard'
    last_4: string;       // last four digits
    expiry_month: string;
    expiry_year: string;
  };
}
```

### Paying with a stored instrument

```ts
const result = await lite.pay({ instrument_id: instruments[0].id });
```

---

## Session Data

The current checkout session is available synchronously after `Lite.init` resolves:

```ts
const session = lite.session; // LiteCheckoutSession
```

### `LiteCheckoutSession` (selected fields)

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Session ID |
| `status` | `string` | Current session status |
| `amount` | `number` | Order amount |
| `currency` | `string` | ISO 4217 currency code |
| `payment_methods` | `array` | Available payment methods for this session |
| `customer` | `object` | Customer details (if provided) |
| `order` | `object` | Order metadata |

---

## Cleanup

Call `lite.destroy()` when unmounting your checkout UI (e.g., in a React `useEffect` cleanup
or when navigating away) to remove all iframes and tear down the singleton:

```ts
lite.destroy();
```

Individual elements can also be destroyed independently:

```ts
cardNumberField.destroy();
applePayButton.destroy();
```

---

## Type Reference

All public types are available as named exports:

```ts
import Lite, {
  Environment,
  PaymentMethod,
  PaymentOperationStatus,
  // Types (TypeScript only):
  type InitConfig,
  type LiteCheckoutSession,
  type PayParams,
  type PaymentMethodType,
  type PaymentPollingResult,
  type StoredInstrument,
  type FieldState,
} from '@litenpm/hosted-fields-sdk';
```

| Export | Kind | Description |
|---|---|---|
| `Lite` | class | Main SDK class (default export) |
| `Environment` | enum | `PRODUCTION`, `STAGING`, `DEVELOPMENT`, `LOCAL` |
| `PaymentMethod` | enum | `card`, `applePay`, `samsungPay`, `googlePay` |
| `PaymentOperationStatus` | enum | `success`, `failure`, `processing` |
| `InitConfig` | interface | Config passed to `Lite.init()` |
| `LiteCheckoutSession` | interface | Full session object from `lite.session` |
| `PayParams` | type | Argument to `lite.pay()` |
| `PaymentMethodType` | type | `'card' | 'applePay' | 'samsungPay' | 'googlePay'` |
| `PaymentPollingResult` | interface | Return value of `lite.pay()` |
| `StoredInstrument` | interface | Entry from `lite.getStoredInstruments()` |
| `FieldState` | interface | Payload of card field `change` events |

---

## Events Reference

| Element | Event | Payload | When |
|---|---|---|---|
| `CardFieldElement` | `change` | `FieldState` | Field validation state changes |
| `ApplePayButton` | `result` | `PaymentPollingResult` | Apple Pay session ends |

All event emitters support `on`, `once`, and `off`:

```ts
const handler = (state: FieldState) => { /* ... */ };
field.on('change', handler);   // subscribe
field.off('change', handler);  // unsubscribe
field.once('change', handler); // fire once then auto-remove
```
