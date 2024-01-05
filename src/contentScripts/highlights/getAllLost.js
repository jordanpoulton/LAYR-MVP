import { getFromBackgroundPage } from "../utils/getFromBackgroundPage";

const getAllLost = async () => {
  const href = window.location.href;
  const lostHighlights = await getFromBackgroundPage({
    action: "GET_LOST_HIGHLIGHTS_FROM_FIREBASE",
    data: {
      href,
    },
  });
  return lostHighlights || [];
};

export default getAllLost;
