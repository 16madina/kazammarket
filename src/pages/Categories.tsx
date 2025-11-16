import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";
import { useState } from "react";

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parent_id: string | null;
  count: number;
  subcategories?: CategoryWithCount[];
}

const Categories = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const { data: categoriesWithCount, isLoading } = useQuery({
    queryKey: ["categories-with-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;

      // Get listing counts for each category
      const categoriesWithCounts = await Promise.all(
        data.map(async (category) => {
          const { count } = await supabase
            .from("listings")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id)
            .eq("status", "active");
          
          return {
            ...category,
            count: count || 0,
          };
        })
      );

      // Build hierarchical structure
      const parentCategories = categoriesWithCounts.filter(cat => !cat.parent_id);
      const childCategories = categoriesWithCounts.filter(cat => cat.parent_id);

      const hierarchical = parentCategories.map(parent => ({
        ...parent,
        subcategories: childCategories.filter(child => child.parent_id === parent.id)
      }));

      // Sort: Gratuit first, then alphabetical, Autres last
      return hierarchical.sort((a, b) => {
        if (a.slug === 'gratuit') return -1;
        if (b.slug === 'gratuit') return 1;
        if (a.slug === 'autres') return 1;
        if (b.slug === 'autres') return -1;
        return a.name.localeCompare(b.name);
      });
    },
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filteredCategories = categoriesWithCount?.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.subcategories?.some(sub => 
                           sub.name.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    return matchesSearch;
  });

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Catégories</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <MessageCircle className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button className="flex-1 py-3 text-center text-muted-foreground hover:text-foreground">
            Vendre
          </button>
          <button className="flex-1 py-3 text-center text-muted-foreground hover:text-foreground">
            Pour vous
          </button>
          <button className="flex-1 py-3 text-center border-b-2 border-primary text-primary font-medium">
            Catégories
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 pb-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Toutes catégories</h2>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCategories?.map((category) => {
              const IconComponent = Icons[category.icon as keyof typeof Icons] as any;
              const hasSubcategories = category.subcategories && category.subcategories.length > 0;
              const isExpanded = expandedCategories.has(category.id);
              
              return (
                <Card key={category.id} className="overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => {
                      if (hasSubcategories) {
                        toggleCategory(category.id);
                      } else {
                        navigate(`/search?category=${category.id}`);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {IconComponent && (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.count} {category.count === 1 ? 'annonce' : 'annonces'}
                        </p>
                      </div>
                    </div>
                    {hasSubcategories && (
                      isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )
                    )}
                  </div>

                  {/* Subcategories */}
                  {hasSubcategories && isExpanded && (
                    <div className="border-t bg-accent/20">
                      {category.subcategories?.map((subcategory) => {
                        const SubIconComponent = Icons[subcategory.icon as keyof typeof Icons] as any;
                        
                        return (
                          <div
                            key={subcategory.id}
                            className="flex items-center justify-between p-3 pl-16 cursor-pointer hover:bg-accent/50 transition-colors border-b last:border-b-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/search?category=${subcategory.id}`);
                            }}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {SubIconComponent && (
                                <SubIconComponent className="h-4 w-4 text-primary/70" />
                              )}
                              <p className="text-sm">{subcategory.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {subcategory.count}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Categories;
