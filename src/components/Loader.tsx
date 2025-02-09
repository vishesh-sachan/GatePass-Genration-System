const Loader= () => {
    return (
    <div className="relative w-[130px] h-[4px] rounded-full bg-black/20 overflow-hidden">
      <div className="absolute top-0 left-0 h-full w-0 bg-[#1D4977] rounded-full animate-moving" />
      <style jsx>{`
        @keyframes moving {
        50% {
          width: 100%;
        }
        100% {
          width: 0;
          right: 0;
          left: unset;
        }
        }
        .animate-moving {
        animation: moving 1s ease-in-out infinite;
        }
      `}</style>
    </div>
    );
  };
  
  export default Loader;
  