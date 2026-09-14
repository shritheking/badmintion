"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    category: "",
    club: "",
    partnerName: "",
    partnerMobile: "",
    partnerEmail: "",
    tshirtSize: "",
    emergencyName: "",
    emergencyNumber: "",
    agreement: false
  });

  const categoryFees: Record<string, number> = {
    "Men's Singles": 500,
    "Men's Doubles": 800,
  };

  const isDoubles = formData.category.includes("Doubles");
  const amount = formData.category ? categoryFees[formData.category] : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreement) {
      setError("Please agree to the tournament rules.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // 1. Create order on our backend
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, amount })
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      // 2. Load Razorpay SDK
      const res = await loadRazorpay();
      if (!res) throw new Error("Razorpay SDK failed to load. Are you online?");

      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "SMASHPRO",
        description: `Registration for ${formData.category}`,
        image: window.location.origin + "/logo.png",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            setLoading(true);
            // 4. Verify payment on our backend
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbId: orderData.dbId
              })
            });
            
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error);
            
            // 5. Redirect to confirmation
            router.push(`/confirmation/${verifyData.registrationId}`);
          } catch (err: any) {
            setError(err.message || "Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.mobile
        },
        theme: {
          color: "#3b82f6" // Primary color (blue-500 equivalent)
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      
      paymentObject.open();

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Tournament Registration</h1>
            <p className="text-muted-foreground mt-2">Fill in your details below. Fields marked with * are required.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Player Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Player Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <input required name="fullName" value={formData.fullName} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Rahul Kumar" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number *</label>
                  <input required type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="9876543210" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth *</label>
                  <input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender *</label>
                  <select required name="gender" value={formData.gender} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium">Address *</label>
                <input required name="address" value={formData.address} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="House No, Street, Landmark" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City *</label>
                  <input required name="city" value={formData.city} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Chennai" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State *</label>
                  <input required name="state" value={formData.state} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Tamil Nadu" />
                </div>
              </div>
            </section>

            {/* Tournament Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Tournament Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Category *</label>
                  <select required name="category" value={formData.category} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select Category</option>
                    {Object.keys(categoryFees).map(cat => (
                      <option key={cat} value={cat}>{cat} - ₹{categoryFees[cat]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Club / Organization (Optional)</label>
                  <input name="club" value={formData.club} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Smashers Club" />
                </div>
              </div>

              {isDoubles && (
                <div className="p-4 bg-slate-50 border rounded-xl space-y-4 mt-4">
                  <h3 className="font-medium text-primary">Doubles Partner Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Partner Name *</label>
                      <input required name="partnerName" value={formData.partnerName} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Partner Mobile *</label>
                      <input required type="tel" name="partnerMobile" value={formData.partnerMobile} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Summary & Agreement */}
            <section className="space-y-6 pt-4 border-t">
              <div className="bg-primary/5 p-4 rounded-xl flex justify-between items-center border border-primary/20">
                <span className="font-medium">Total Registration Fee</span>
                <span className="text-2xl font-bold text-primary">₹{amount}</span>
              </div>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="agreement"
                  checked={formData.agreement}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="text-sm text-muted-foreground leading-snug">
                  I confirm that the information provided is correct and I agree to the tournament rules, terms, and refund policy.
                </span>
              </label>

              <button 
                type="submit" 
                disabled={loading || !formData.category || !formData.agreement}
                className="w-full h-14 md:h-12 inline-flex items-center justify-center rounded-md bg-primary px-8 text-base font-bold text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sticky bottom-4 z-10 md:static"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Payment...</>
                ) : (
                  `Proceed to Payment (₹${amount})`
                )}
              </button>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
}
