import nc from "next-connect";

const baseHandler = () => nc({ attachParams: true });

export default baseHandler;
