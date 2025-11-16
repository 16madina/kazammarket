import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

const CategoryDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  // Get parent category
  const { data: parentCategory, isLoading: parentLoading } = useQuery({
    queryKey: ["parent-category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, icon")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Get subcategories
  const { data: subcategories, isLoading: subcategoriesLoading } = useQuery({
    queryKey: ["subcategories", parentCategory?.id],
    queryFn: async () => {
      if (!parentCategory?.id) return [];
      
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, icon")
        .eq("parent_id", parentCategory.id)
        .order("name");
      
      if (error) throw error;

      // Get listing counts for each subcategory
      const subcategoriesWithCounts = await Promise.all(
        data.map(async (subcategory) => {
          const { count } = await supabase
            .from("listings")
            .select("*", { count: "exact", head: true })
            .eq("category_id", subcategory.id)
            .eq("status", "active");
          
          return {
            ...subcategory,
            count: count || 0,
          };
        })
      );

      return subcategoriesWithCounts;
    },
    enabled: !!parentCategory?.id,
  });

  // Get listings for selected subcategory or parent
  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ["category-listings", selectedSubcategoryId || parentCategory?.id],
    queryFn: async () => {
      const categoryId = selectedSubcategoryId || parentCategory?.id;
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            city
          )
        `)
        .eq("category_id", categoryId)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!(selectedSubcategoryId || parentCategory?.id),
  });

  const isLoading = parentLoading || subcategoriesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 bg-background">
        <div className="bg-background border-b sticky top-0 z-10">
          <div className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{parentCategory?.name}</h1>
        </div>
      </div>

      {/* Subcategories Tabs */}
      {subcategories && subcategories.length > 0 && (
        <div className="border-b bg-background sticky top-[73px] z-10 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 py-2">
            <button
              onClick={() => setSelectedSubcategoryId(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedSubcategoryId === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Tout
            </button>
            {subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => setSelectedSubcategoryId(subcategory.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedSubcategoryId === subcategory.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {subcategory.name} ({subcategory.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Listings */}
      <div className="p-4">
        {listingsLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={listing.images?.[0] || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-lg text-primary">
                    {listing.price.toLocaleString()} {listing.currency || "FCFA"}
                  </p>
                  <p className="text-sm line-clamp-2 mt-1">{listing.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {listing.profiles?.city}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Aucune annonce disponible</p>
            <p className="text-sm mt-2">Soyez le premier à publier dans cette catégorie</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CategoryDetail;
