import Image from "next/image";
import maskImageForMobileCard from "../../app/assets/Background.png";
import iPhone1 from "../../app/assets/iPhone1.png";
import iPhone2 from "../../app/assets/iPhone2.png";
import iPhone3 from "../../app/assets/iPhone3.png";
import whatsapp from "../../app/assets/WhatsApp.png";
import playStore from "../../app/assets/Google Play.png";
import appStore from "../../app/assets/App Store.png";
import YouTube from "../../app/assets/Youtub.png";

export default function MobileAppShowcase() {
  return (
    <div
      className="flex w-full h-[200px] rounded-md overflow-visible relative"
      style={{
        backgroundImage: `url(${maskImageForMobileCard.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#026419",
      }}
    >
      {/* Left Section */}
      <div className="flex-1 flex items-center px-8">
        <div className="text-white">
          <h2 className="text-2xl font-bold mb-2">Idreesia</h2>
          <p className="text-sm opacity-90">
            Want to start your spiritual journey? <br /> Share your moments with
            us. Follow us on Social Media.
          </p>
          <ul className="inline-flex mt-5 gap-2">
            <li>
              <Image src={whatsapp} alt="whatsapp" />
            </li>
            <li>
              <Image src={playStore} alt="playstore" />
            </li>
            <li>
              <Image src={appStore} alt="app store" />
            </li>
            <li>
              <Image src={YouTube} alt="YouTube" />
            </li>
          </ul>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 relative flex justify-end items-end overflow-visible">
        {/* Left Phone */}
        <div className="relative left-[110px] -translate-y-1 ">
          <Image src={iPhone3} alt="phone left" className="h-[250px] " />
        </div>

        {/* Middle Phone */}
        <div className="relative left-[60px] -translate-y-1 z-20">
          <Image src={iPhone1} alt="phone middle" className="h-[280px] " />
        </div>

        {/* Right Phone */}
        <div className="relative right-[0px] -translate-y-1 ">
          <Image src={iPhone2} alt="phone right" className="h-[250px] " />
        </div>
      </div>
    </div>
  );
}
