import Header from "./Header";
import Footer from "./Footer";

// Layout wraps every page that needs a header and footer.
// Usage:
//   <Layout>
//     <YourPageContent />
//   </Layout>

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;