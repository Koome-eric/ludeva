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
        id: 24,
        title: "Directors & Staff",
        path: "/about/directors",
        newTab: false,
      },
    ],
  },

  {
    id: 7,
    title: "L Chama",
    path: "/about/teams",
    newTab: false,
  },
  {
    id: 8,
    title: "Blogs",
    path: "/about/blog",
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
        path: "/mmf",
        newTab: false,
      },
      {
        id: 42,
        title: "Ludeva Stocks",
        path: "/stocks-bonds",
        newTab: false,
      },
      {
        id: 45,
        title: "Fixed Deposit Account",
        path: "/services/fixed-deposit",
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
    id: 6,
    title: "Gallery",
    path: "/gallery",
    newTab: false,
  },
];
export default menuData;
