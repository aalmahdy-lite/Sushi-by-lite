import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lite, PaymentOperationStatus } from "@litenpm/hosted-fields-sdk";
import { MENU } from "../data/menu.js";
import { useCart } from "../context/CartContext.jsx";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cart } = useCart();

  const token = useMemo(() => searchParams.get("cs") || "", [searchParams]);

  const entries = Object.entries(cart);
  const cartIsEmpty = entries.length === 0;

  const session = useMemo(() => (token ? parseJwt(token) : {}), [token]);

  const sub = entries.reduce(
    (s, [id, q]) => s + (MENU.find((i) => i.id === +id)?.price || 0) * q,
    0,
  );
  const vat = sub * 0.15;
  const total = entries.length ? sub + vat : session.amount / 100 || 0;

  const [sdkStatus, setSdkStatus] = useState({
    type: "loading",
    text: "Initialising…",
  });
  const [payEnabled, setPayEnabled] = useState(false);
  const [payBtnState, setPayBtnState] = useState("idle"); // idle | loading | retry
  const [shimmersVisible, setShimmersVisible] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const [applePayActive, setApplePayActive] = useState(false);

  // Redirect home if there's no client secret, or if the cart is empty
  // (and payment hasn't succeeded yet).
  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    if (cartIsEmpty && !orderId) {
      navigate("/", { replace: true });
    }
  }, [token, cartIsEmpty, orderId, navigate]);

  // Warn the user when they try to close or reload the tab while a session
  // is active — the cart lives only in memory so it would be lost. In-app
  // navigation (<Link> clicks) is fine because the cart persists across
  // routes via CartContext.
  useEffect(() => {
    if (!token || orderId) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [token, orderId]);

  const liteRef = useRef(null);
  const applePayRef = useRef(null);
  const initedRef = useRef(false);

  useEffect(() => {
    document.title = "Checkout — Sushi by Lite";
  }, []);

  useEffect(() => {
    if (!token) return;
    if (initedRef.current) return;
    initedRef.current = true;

    let lite;

    (async () => {
      try {
        setSdkStatus({ type: "loading", text: "Initialising…" });

        lite = await Lite.init({
          secret: token,
          environment: "development",
        });

        liteRef.current = lite;

        const elements = lite.elements();
        const cardholderName = elements.create("cardholderName");
        const cardNumber = elements.create("cardNumber");
        const expiry = elements.create("expiry");
        const cvv = elements.create("cvv");

        await Promise.all([
          cardholderName.mount("#cardholder-name-container"),
          cardNumber.mount("#card-number-container"),
          expiry.mount("#expiry-container"),
          cvv.mount("#cvv-container"),
        ]);

        const applePayEnabled =
          lite?.session?.payment_methods?.apple_pay?.status === "ACTIVE";
        setApplePayActive(applePayEnabled);

        if (applePayEnabled) {
          try {
            const applePayButton = elements.create("apple_pay");
            applePayRef.current = applePayButton;
            applePayButton.on("result", (result) => {
              if (result?.status === PaymentOperationStatus.SUCCESS) {
                const id =
                  result.payment?.payment?.id ||
                  session.orderId ||
                  "PAY-" + Date.now().toString(36).toUpperCase();
                setOrderId(id);
              } else if (result?.status === PaymentOperationStatus.FAILURE) {
                setSdkStatus({
                  type: "error",
                  text: result?.error || "Apple Pay failed",
                });
              }
            });
            await applePayButton.mount("#apple-pay-button");
          } catch (err) {
            console.warn("Apple Pay unavailable:", err);
          }
        }

        setTimeout(() => {
          setShimmersVisible(false);
          setSdkStatus({ type: "ready", text: "Ready" });
          setPayEnabled(true);
        }, 1200);
      } catch (err) {
        console.error("SDK init failed:", err);
        setSdkStatus({
          type: "error",
          text: err?.message || "SDK failed to load",
        });
      }
    })();

    return () => {
      try {
        applePayRef.current?.destroy?.();
      } catch {}
      try {
        liteRef.current?.destroy?.();
      } catch {}
    };
  }, [token]);

  async function handlePayment() {
    const lite = liteRef.current;
    if (!lite) return;
    setPayBtnState("loading");
    setPayEnabled(false);
    try {
      const result = await lite.pay({ payment_method: "card" });

      if (result?.status === PaymentOperationStatus.SUCCESS) {
        const id =
          result.payment?.payment?.id ||
          session.orderId ||
          "PAY-" + Date.now().toString(36).toUpperCase();
        setOrderId(id);
      } else {
        throw new Error(result?.error || "Payment failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setPayBtnState("retry");
      setPayEnabled(true);
      setSdkStatus({ type: "error", text: err.message || "Payment failed" });
    }
  }

  const statusClasses = {
    loading: "text-muted",
    ready: "text-green",
    error: "text-red",
  };
  const dotClasses = {
    loading: "bg-muted",
    ready: "bg-green",
    error: "bg-red",
  };

  if (!token) return null;
  if (cartIsEmpty && !orderId) return null;

  return (
    <>
      <nav className="bg-[rgba(10,10,10,0.95)] border-b border-border flex items-center justify-between px-12 h-16">
        <Link
          to="/"
          className="text-[22px] font-extrabold tracking-[3px] text-accent uppercase no-underline"
        >
          Sushi<span className="text-text font-light"> by Lite</span>
        </Link>
        <Link
          to="/"
          className="text-[13px] text-muted no-underline flex items-center gap-1.5 transition-colors hover:text-text"
        >
          ← Back to menu
        </Link>
      </nav>

      <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 md:grid-cols-[1fr_460px]">
        {/* LEFT: FORM */}
        <div className="p-12 md:border-r border-border">
          <div className="flex items-center gap-2 mb-9">
            <Step state="done" num="✓" label="Cart" />
            <StepSep />
            <Step state="active" num="2" label="Details" />
            <StepSep />
            <Step state="pending" num="3" label="Payment" />
            <StepSep />
            <Step state="pending" num="4" label="Confirm" />
          </div>

          <div className="mb-9">
            <h1 className="text-[28px] font-extrabold tracking-[-0.5px] mb-1.5">
              Complete your order
            </h1>
            <p className="text-[14px] text-muted">
              Secured by Lite Hosted Fields — card data never touches this page
            </p>
          </div>

          {/* CONTACT */}
          <FormSection title="Contact">
            <div className="grid gap-[14px] grid-cols-2 mb-[14px]">
              <FormField
                label="First Name"
                id="first-name"
                placeholder="Ahmad"
              />
              <FormField
                label="Last Name"
                id="last-name"
                placeholder="Al-Rashidi"
              />
            </div>
            <div className="grid gap-[14px] grid-cols-2 mb-[14px]">
              <FormField
                label="Email"
                id="email"
                type="email"
                placeholder="ahmad@example.com"
              />
              <FormField
                label="Phone"
                id="phone"
                type="tel"
                placeholder="+966 5X XXX XXXX"
              />
            </div>
          </FormSection>

          {/* DELIVERY */}
          <FormSection title="Delivery">
            <div className="grid gap-[14px] mb-[14px]">
              <FormField
                label="Address"
                id="address"
                placeholder="Street, building, apartment"
              />
            </div>
            <div className="grid gap-[14px] grid-cols-3 mb-[14px]">
              <FormField label="City" id="city" placeholder="Riyadh" />
              <FormField
                label="District"
                id="district"
                placeholder="Al Olaya"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-muted font-medium">
                  Time
                </label>
                <select
                  id="delivery-time"
                  className="bg-surface2 border border-border rounded-lg text-text px-3.5 py-3 text-[14px] outline-none transition-colors w-full focus:border-accent"
                >
                  <option>ASAP (~30–45 min)</option>
                  <option>In 1 hour</option>
                  <option>Schedule for later</option>
                </select>
              </div>
            </div>
          </FormSection>

          {/* LITE SDK SECTION */}
          <div className="mb-7 border border-border rounded-xl overflow-hidden">
            <div className="bg-surface2 px-5 py-[14px] border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] uppercase tracking-[2px] text-accent font-semibold">
                  Payment
                </span>
                <span className="text-[10px] bg-accent/[0.12] text-accent border border-accent/25 px-2 py-0.5 rounded font-bold tracking-[0.5px]">
                  ⚡ Lite SDK
                </span>
              </div>
              <div
                className={`text-[11px] flex items-center gap-1.5 ${statusClasses[sdkStatus.type]}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${dotClasses[sdkStatus.type]}`}
                />
                <span>{sdkStatus.text}</span>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-[14px]">
              {applePayActive && (
                <>
                  <div id="apple-pay-button" className="w-full" />
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[2px] text-muted">
                    <span className="flex-1 h-px bg-border" />
                    <span>or pay with card</span>
                    <span className="flex-1 h-px bg-border" />
                  </div>
                </>
              )}
              <FieldContainer
                id="cardholder-name-wrapper"
                containerId="cardholder-name-container"
                shimmerWidth="w-[60%]"
                shimmersVisible={shimmersVisible}
              />
              <FieldContainer
                id="card-number-wrapper"
                containerId="card-number-container"
                shimmerWidth="w-[40%]"
                shimmersVisible={shimmersVisible}
              />

              <div className="grid grid-cols-2 gap-[14px]">
                <FieldContainer
                  id="expiry-wrapper"
                  containerId="expiry-container"
                  shimmerWidth="w-[30%]"
                  shimmersVisible={shimmersVisible}
                />
                <FieldContainer
                  id="cvv-wrapper"
                  containerId="cvv-container"
                  shimmerWidth="w-[30%]"
                  shimmersVisible={shimmersVisible}
                />
              </div>

              <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-accent/[0.05] border border-accent/15 rounded-lg text-[12px] text-muted leading-[1.6]">
                <span>🔐</span>
                <span>
                  Card fields are isolated iframes served by Lite. Each value is
                  encrypted with AES-256-GCM + RSA-OAEP before leaving the
                  iframe — your server never sees raw card data.
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={!payEnabled || payBtnState === "loading"}
            className={`w-full p-4 rounded-[10px] text-[16px] font-bold cursor-pointer transition-all mt-1 tracking-[0.2px] border-none ${
              !payEnabled || payBtnState === "loading"
                ? "bg-surface2 text-muted border border-border cursor-not-allowed"
                : "bg-accent text-black hover:bg-accent2 hover:-translate-y-[1px]"
            } ${payBtnState === "loading" ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {payBtnState === "loading" ? (
              "Processing…"
            ) : payBtnState === "retry" ? (
              "Try again"
            ) : (
              <>
                Pay <span>SAR {total.toFixed(2)}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 justify-center mt-3.5 text-[12px] text-muted">
            <span>🔒</span>
            <span>PCI-DSS compliant · 3DS 2.x · Powered by Lite</span>
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="px-9 py-12 bg-surface">
          <div className="text-[13px] font-bold uppercase tracking-[1.5px] mb-7 text-muted">
            Order Summary
          </div>
          {entries.length > 0 && (
            <>
              <div>
                {entries.map(([id, qty]) => {
                  const item = MENU.find((i) => i.id === +id);
                  if (!item) return null;
                  return (
                    <div key={id} className="flex items-center gap-3.5 mb-4">
                      <div className="text-[26px] w-[46px] h-[46px] bg-surface2 rounded-[10px] flex items-center justify-center flex-shrink-0">
                        {item.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-semibold mb-0.5">
                          {item.name}
                        </div>
                        <div className="text-[12px] text-muted">× {qty}</div>
                      </div>
                      <div className="text-[14px] font-bold text-accent">
                        SAR {(item.price * qty).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <hr className="border-none border-t border-border my-5" />
              <div>
                <div className="flex justify-between mb-2.5 text-[13px] text-muted">
                  <span>Subtotal</span>
                  <span>SAR {sub.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2.5 text-[13px] text-muted">
                  <span>Delivery</span>
                  <span className="text-green">Free</span>
                </div>
                <div className="flex justify-between mb-2.5 text-[13px] text-muted">
                  <span>VAT (15%)</span>
                  <span>SAR {vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-1 text-[18px] font-extrabold text-text">
                  <span>Total</span>
                  <span className="text-accent">SAR {total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      {orderId && (
        <div className="fixed inset-0 bg-bg z-[500] flex flex-col items-center justify-center text-center">
          <div className="text-[72px] mb-6">🎉</div>
          <h2 className="text-[32px] font-extrabold mb-2">Order Confirmed!</h2>
          <p className="text-[15px] text-muted mb-8">
            Your sushi is being prepared. Estimated delivery: 30–45 min.
          </p>
          <div className="font-mono text-[13px] text-accent bg-surface px-4 py-2 rounded-md border border-border">
            {orderId}
          </div>
          <div className="mt-6">
            <Link to="/" className="text-accent text-[14px] no-underline">
              ← Back to menu
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ state, num, label }) {
  const numClasses = {
    done: "bg-green text-black",
    active: "bg-accent text-black",
    pending: "bg-surface2 text-muted border border-border",
  };
  const labelClasses = {
    done: "text-text",
    active: "text-text font-semibold",
    pending: "text-muted",
  };
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${numClasses[state]}`}
      >
        {num}
      </span>
      <span className={labelClasses[state]}>{label}</span>
    </div>
  );
}

function StepSep() {
  return <div className="flex-1 h-px bg-border max-w-[32px]" />;
}

function FormSection({ title, children }) {
  return (
    <div className="mb-8">
      <div className="text-[11px] uppercase tracking-[2px] text-accent font-semibold mb-4 pb-2.5 border-b border-border">
        {title}
      </div>
      {children}
    </div>
  );
}

function FormField({ label, id, type = "text", placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[12px] text-muted font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="bg-surface2 border border-border rounded-lg text-text px-3.5 py-3 text-[14px] outline-none transition-colors w-full focus:border-accent placeholder:text-muted"
      />
    </div>
  );
}

function FieldContainer({ id, containerId, shimmerWidth, shimmersVisible }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        id={id}
        className="bg-white border border-border rounded-lg min-h-12 overflow-hidden transition-colors relative"
      >
        {shimmersVisible && (
          <div className="absolute inset-0 rounded-lg bg-surface2 flex items-center px-3.5 pointer-events-none overflow-hidden">
            <div className={`h-3.5 rounded bg-border ${shimmerWidth}`} />
            <span className="absolute top-0 -left-full w-[60%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer" />
          </div>
        )}
        <div id={containerId} />
      </div>
    </div>
  );
}
