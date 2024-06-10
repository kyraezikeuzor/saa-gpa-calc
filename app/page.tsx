import Image from "next/image";
import Calculator from './Calculator'

export default function Home() {
  return (
    <main className="flex flex-col m-auto">
      <Calculator/>
    </main>
  );
}
