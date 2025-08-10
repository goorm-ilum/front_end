const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-white/20 w-full py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-600 font-medium">© 2025 TalkTrip. All rights reserved.</p>
          <p className="text-gray-500 text-sm">
            Contact: <a href="mailto:support@TalkTrip.com" className="text-blue-600 hover:text-blue-700 underline font-medium transition-colors duration-300">support@TalkTrip.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
