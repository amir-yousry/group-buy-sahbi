// 404 / Not Found
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-warm">
    <h1 className="text-7xl font-extrabold text-primary mb-2">٤٠٤</h1>
    <p className="text-muted-foreground mb-6">الصفحة غير موجودة</p>
    <Link to="/">
      <Button>العودة للرئيسية</Button>
    </Link>
  </div>
);

export default NotFound;
