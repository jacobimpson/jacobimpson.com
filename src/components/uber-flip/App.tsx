import { useState, type FC } from "react";
import ListItem from "./ListItem";

const App: FC = () => {
  const [openId, setOpenId] = useState();

  const toggleOpen = (id) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }

    setOpenId(id);
  };

  return (
    <ul className="flex flex-col gap-2 ">
      <ListItem onClick={() => toggleOpen(1)} id={1} openId={openId} />
      <ListItem onClick={() => toggleOpen(2)} id={2} openId={openId} />
      <ListItem onClick={() => toggleOpen(3)} id={3} openId={openId} />
      {/* <ListItem onClick={() => toggleOpen(4)} id={4} openId={openId} /> */}
      {/* <ListItem onClick={() => toggleOpen(5)} id={5} openId={openId} /> */}
      {/* <ListItem onClick={() => toggleOpen(6)} id={6} openId={openId} /> */}
    </ul>
  );
};

export default App;
