type NavigationLink = {
  text: string;
  path: string;
  hidePattern: RegExp;
};

const navigationLinks: Array<NavigationLink> = [
  {
    text: "Dashboard",
    path: "/dashboard",
    hidePattern: /^\/dashboard/,
  },
];

export default navigationLinks;
