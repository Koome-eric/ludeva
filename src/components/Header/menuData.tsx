import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    title: "About",
    newTab: false,
    submenu: [
      {
        id: 21,
        title: "About Us",
        path: "/about/about-us",
        newTab: false,
      },
      {
        id: 22,
        title: "Teams",
        path: "/about/teams",
        newTab: false,
      },
      {
        id: 23,
        title: "Blogs",
        path: "/about/blog",
        newTab: false,
      },
    ],
    },
  {
    id: 3,
    title: "Support",
    path: "/contact",
    newTab: false,
  },
  {
    id: 3,
    title: "Gallery",
    path: "/gallery",
    newTab: false,
  },
  {
  id: 4,
  title: "Services",
  newTab: false,
  submenu: [
    {
      id: 41,
      title: "Money Market Funds",
      path: "/services/money-market",
      newTab: false,
    },
    {
      id: 42,
      title: "Music & Film Aggregation",
      path: "/services/music",
      newTab: false,
    },
    {
      id: 43,
      title: "Documents Hub",
      path: "/services/documents",
      newTab: false,
    },
    
  ],
  },
  {
    id: 5,
    title: "Upcoming Projects",
    newTab: false,
    submenu: [
      {
      id: 51,
      title: "Real Estate Investment",
      path: "/upcoming/real-estate",
      newTab: false,
    },
    {
      id: 52,
      title: "Community Agriculture",
      path: "/upcoming/agribusiness",
      newTab: false,
    },
    {
      id: 53,
      title: "SME Development Funds",
      path: "/upcoming/sme-funding",
      newTab: false,
    },
    ],
    },
];
export default menuData;
