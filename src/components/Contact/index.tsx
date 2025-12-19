"use client";

import { useState } from "react";
import NewsLatterBox from "./NewsLatterBox";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      message: e.target.message.value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send");

      setSuccess(true);
      e.target.reset();
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-7/12 xl:w-8/12">
            <div className="mb-12 rounded-xs bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px]">
              <h2 className="mb-3 text-2xl font-bold text-black dark:text-white">
                Talk to Ludeva
              </h2>
              <p className="mb-12 text-base font-medium text-body-color">
                Whether you&apos;re ready to invest, need assistance, or want to collaborate — our team is here to support your journey.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4 md:w-1/2">
                    <input
                      name="name"
                      required
                      placeholder="Your Name"
                      className="mb-8 w-full rounded-xs border bg-[#f8f8f8] px-6 py-3"
                    />
                  </div>

                  <div className="w-full px-4 md:w-1/2">
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="Your Email"
                      className="mb-8 w-full rounded-xs border bg-[#f8f8f8] px-6 py-3"
                    />
                  </div>

                  <div className="w-full px-4">
                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="Your Message"
                      className="mb-8 w-full resize-none rounded-xs border bg-[#f8f8f8] px-6 py-3"
                    />
                  </div>

                  <div className="w-full px-4">
                    <button
                      disabled={loading}
                      className="rounded-xs bg-primary px-9 py-4 text-white disabled:opacity-70"
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </button>
                  </div>

                  {success && (
                    <p className="mt-4 text-green-600">
                      Message sent successfully!
                    </p>
                  )}

                  {error && (
                    <p className="mt-4 text-red-600">{error}</p>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="w-full px-4 lg:w-5/12 xl:w-4/12">
            <NewsLatterBox />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
