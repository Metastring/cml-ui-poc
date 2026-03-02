import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Cataloging and Mapping Life of India
        </h1>
        <p className="text-muted-foreground text-lg mb-6">
          Explore geographically referenced ecological, health and climate data.
        </p>
        <div className="flex justify-center gap-4">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Learn More</Button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Link href="/federated_search">
          <Card className="bg-card border-secondary/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2 text-foreground">Federated Search</h2>
              <p className="text-muted-foreground mb-2">
                Federated Search queries multiple remote databases and returns
                unified results in a single view.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/map_search"><Card className="bg-card border-secondary/20">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2 text-foreground">Map Search</h2>
            <p className="text-muted-foreground mb-2">
              View layers, draw polygons on the map and explore available
              layers.
            </p>
          </CardContent>
        </Card></Link>

        <Link href="/contribute"><Card className="bg-card border-secondary/20">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              Register Your Dataset
            </h2>
          </CardContent>
        </Card></Link>


        <Link href="/datasets">
          <Card className="bg-card border-secondary/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2 text-foreground">
                Explore Dataset catalog
              </h2>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
