import Main from "./_components/main/Main";
import Menu from "./_components/menu/Menu";
import NewTabFloatButton from "./_components/NewTabFloatButton";

export default function Home() {
  return (
    <div className="flex h-full w-full">
      <Menu />
      <Main />
      <NewTabFloatButton />
    </div>
  );
}
