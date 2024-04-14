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
    <ul className="flex flex-col gap-2">
      <ListItem
        title="Business Comfort"
        subtitle="4:46pm · 4 min away"
        price="$53.82"
        onClick={() => toggleOpen(1)}
        id={1}
        openId={openId}
      />
      <ListItem
        title="UberX"
        subtitle="4:46pm · 3 min away"
        price="$45.59"
        faster
        onClick={() => toggleOpen(2)}
        id={2}
        openId={openId}
      />
      <ListItem
        title="UberXL"
        subtitle="4:46pm · 4 min away"
        price="$75.33"
        onClick={() => toggleOpen(3)}
        id={3}
        openId={openId}
      />
    </ul>
  );
};

export default App;
