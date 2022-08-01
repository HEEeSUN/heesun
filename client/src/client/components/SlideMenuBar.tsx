type Props = {
  menuTitle1: string;
  menuTitle2: string;
  clickedMenu: number;
  setClickedMenu: React.Dispatch<React.SetStateAction<number>>;
};

function SlideMenuBar(props: Props) {
  const { menuTitle1, menuTitle2, clickedMenu, setClickedMenu } = props;

  return (
    <div className="slide-bar">
      <div className="slide-bar-menu">
        <div
          onClick={() => {
            setClickedMenu(1);
          }}
        >
          {menuTitle1}
        </div>
        {clickedMenu === 1 ? <div className="left-bar"></div> : null}
      </div>
      <div className="slide-bar-menu">
        <div
          onClick={() => {
            setClickedMenu(2);
          }}
        >
          {menuTitle2}
        </div>
        {clickedMenu === 2 ? <div className="right-bar"></div> : null}
      </div>
    </div>
  );
}

export default SlideMenuBar;
