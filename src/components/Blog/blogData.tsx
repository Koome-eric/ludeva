import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "How to Start Investing in Kenya’s Money Market Funds",
    paragraph:
      "Learn how Ludeva helps beginners in Kenya grow wealth through low-risk, high-yield money market fund opportunities.",
    image: "/images/blog/blog-01.jpg", // Replace with your actual image
    author: {
      name: "Grace Wanjiku",
      image: "/images/blog/author-01.png", // Replace with your actual image
      designation: "Financial Analyst",
    },
    tags: ["money market", "investment"],
    publishDate: "2025-03-10",
  },
  {
    id: 2,
    title: "Why Real Estate Remains a Safe Investment in Kenya",
    paragraph:
      "Explore how Ludeva enables Kenyans to access fractional property ownership and earn consistent returns from local developments.",
    image: "/images/blog/blog-02.jpg",
    author: {
      name: "Michael Otieno",
      image: "/images/blog/author-02.png",
      designation: "Property Investment Consultant",
    },
    tags: ["real estate", "passive income"],
    publishDate: "2025-04-02",
  },
  {
    id: 3,
    title: "Empowering Rural Farmers Through Community Agriculture",
    paragraph:
      "Discover how Ludeva bridges the gap between investors and rural farmers to create shared prosperity and food security.",
    image: "/images/blog/blog-03.jpg",
    author: {
      name: "Achieng Auma",
      image: "/images/blog/author-03.png",
      designation: "Agribusiness Specialist",
    },
    tags: ["agriculture", "community"],
    publishDate: "2025-05-15",
  },
];

export default blogData;
