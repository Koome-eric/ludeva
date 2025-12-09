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
    ],
    },
  {
    id: 33,
    title: "Blog",
    path: "/blog",
    newTab: false,
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
      title: "Real Estate Investment",
      path: "/services/real-estate",
      newTab: false,
    },
    {
      id: 43,
      title: "Community Agriculture",
      path: "/services/agribusiness",
      newTab: false,
    },
    {
      id: 44,
      title: "SME Development Funds",
      path: "/services/sme-funding",
      newTab: false,
    },
    
  ],
  },
];
export default menuData;
