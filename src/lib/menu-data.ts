export type Menu = {
  id: number;
  title: string;
  path?: string;
  newTab: boolean;
  submenu?: Menu[];
};

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
        path: "/about",
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
      {
        id: 24,
        title: "Directors & Staff",
        path: "/about/directors",
        newTab: false,
      },
    ],
    },

    {
  id: 4,
  title: "Services",
  newTab: false,
  submenu: [
    {
      id: 41,
      title: "Money Market Funds",
      path: "/mmf",
      newTab: false,
    },
    {
      id: 42,
      title: "Ludeva Stocks & Bonds",
      path: "/stocks-bonds",
      newTab: false,
    },
    {
      id: 43,
      title: "Documents Hub",
      path: "/services/documents",
      newTab: false,
    },
    {
      id: 44,
      title: "Content Aggregation",
      path: "/services/music",
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

    {
    id: 6,
    title: "Gallery",
    path: "/gallery",
    newTab: false,
  },
];
export default menuData;
