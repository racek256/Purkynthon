import UserIcon from "../assets/user_icon.svg";
export default function Sidebar({ selectTheme }) {
  return (
    <div className="w-5/32 min-w-42 h-dvh  border-r border-border bg-sidebar-bg flex flex-col justify-between">
      <div className=""></div>
      <div className="bg-sidebar-profile-bar-bg h-24 w-full rounded-t-lg p-2">
        <div className="flex items-center ">
          <img src={UserIcon} />
          <span className="text-bold text-2xl truncate"> František Pátek</span>
        </div>

        <div className="flex">
          <p className="w-full ">Lekce1</p>
          <select
            className="bg-sidebar-theme-selector shadow-xl   p-2 rounded-lg"
            onChange={(e) => {
              console.log("setting theme: " + e.target.value);
              selectTheme(e.target.value);
            }}
          >
            <option>mocha</option>
            <option>macchiato</option>
            <option>frappe</option>
            <option>latte</option>
          </select>
        </div>
      </div>
    </div>
  );
}
