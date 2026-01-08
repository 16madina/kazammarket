import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import * as Icons from "lucide-react";
import { Link } from "react-router-dom";

const CategoryGrid = () => {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Filtrer pour afficher seulement les catégories populaires
  const popularSlugs = ['gratuit', 'electronique', 'mode-femme', 'meubles'];
  const popularCategories = categories?.filter(cat => popularSlugs.includes(cat.slug)) || [];

  return (
    <section className="py-6 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Catégories populaires</h2>
          <Link 
            to="/categories" 
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
          >
            Voir plus
            <Icons.ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {popularCategories.map((category) => {
            const IconComponent = Icons[category.icon as keyof typeof Icons] as any;
            return (
              <Link key={category.id} to={`/categories/${category.slug}`}>
                <Card variant="glass" className="p-3 hover:scale-105 cursor-pointer group animate-fade-in h-full">
                  <div className="flex flex-col items-center text-center gap-2 h-full">
                    {IconComponent && (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <span className="font-medium text-xs line-clamp-1 leading-tight">
                      {category.slug === 'gratuit' ? 'Gratuit' : category.name}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
