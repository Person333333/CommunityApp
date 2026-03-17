import { SmokeBackground } from "./spooky-smoke-animation";

const Default = () => {
  return (
    <div className="w-full h-[400px]">
      <SmokeBackground />
    </div>
  );
};

const Customized = () => {
  return (
    <div className="w-full h-[400px]">
      <SmokeBackground smokeColor="#FF0000" />
    </div>
  );
};

export { Default, Customized };
