import { Testimonial } from "@/types/testimonial";
import SectionTitle from "../Common/SectionTitle";
import SingleTestimonial from "./SingleTestimonial";

const testimonialData: Testimonial[] = [
  {
    id: 1,
    name: "Grace Mwangi",
    designation: "MMF Investor",
    content:
      "Investing in Ludeva Money Market Fund has given me stable returns of 14% gross p.a. The platform is easy to use and I can track my earnings anytime.",
    image: "/images/testimonials/auth-01.png",
    star: 5,
  },
  {
    id: 2,
    name: "James Otieno",
    designation: "SME Investor",
    content:
      "Our business has grown through the Ludeva MMF. The quarterly payouts help us manage cash flow while earning predictable returns with minimal risk.",
    image: "/images/testimonials/auth-02.png",
    star: 5,
  },
  {
    id: 3,
    name: "Fatma Noor",
    designation: "Diaspora Investor",
    content:
      "Being abroad, I wanted a safe and transparent investment. Ludeva Money Market Fund delivers steady income, and I can monitor my portfolio online easily.",
    image: "/images/testimonials/auth-03.png",
    star: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="dark:bg-bg-color-dark bg-gray-light relative z-10 py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle
          title="What Our Investors Say"
          paragraph="See how Ludeva Money Market Fund is empowering Kenyans and institutions to grow wealth safely and reliably."
          center
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {testimonialData.map((testimonial) => (
            <SingleTestimonial key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>

      <div className="absolute right-0 top-5 z-[-1]">
        {/* SVG background graphics unchanged */}
      </div>
      <div className="absolute bottom-5 left-0 z-[-1]">
        {/* SVG background graphics unchanged */}
      </div>
    </section>
  );
};

export default Testimonials;
