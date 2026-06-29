import { db } from "./index";
import { budgetCategories, budgetItems } from "./schema";
import { eq, sum, count } from "drizzle-orm";

export type CategoryWithItems = {
  category: typeof budgetCategories.$inferSelect;
  items: (typeof budgetItems.$inferSelect)[];
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
  itemCount: number;
};

export type BudgetSummary = {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
  remaining: number;
  categories: CategoryWithItems[];
};

export async function getBudgetSummary(weddingId: string): Promise<BudgetSummary> {
  const categories = await db
    .select()
    .from(budgetCategories)
    .where(eq(budgetCategories.weddingId, weddingId))
    .orderBy(budgetCategories.sortOrder);

  const items = await db
    .select()
    .from(budgetItems)
    .where(eq(budgetItems.weddingId, weddingId));

  const itemsByCategory = new Map<string, (typeof budgetItems.$inferSelect)[]>();
  for (const item of items) {
    if (!itemsByCategory.has(item.categoryId)) {
      itemsByCategory.set(item.categoryId, []);
    }
    itemsByCategory.get(item.categoryId)!.push(item);
  }

  let totalBudget = 0;
  let totalEstimated = 0;
  let totalActual = 0;
  let totalPaid = 0;

  const categoriesWithItems: CategoryWithItems[] = categories.map((cat) => {
    const catItems = itemsByCategory.get(cat.id) ?? [];
    const catEstimated = catItems.reduce((s, i) => s + i.estimatedAmount, 0);
    const catActual = catItems.reduce((s, i) => s + (i.actualAmount ?? i.estimatedAmount), 0);
    const catPaid = catItems
      .filter((i) => i.isPaid)
      .reduce((s, i) => s + (i.actualAmount ?? i.estimatedAmount), 0);

    totalBudget += cat.budgetedAmount ?? 0;
    totalEstimated += catEstimated;
    totalActual += catActual;
    totalPaid += catPaid;

    return {
      category: cat,
      items: catItems,
      totalEstimated: catEstimated,
      totalActual: catActual,
      totalPaid: catPaid,
      itemCount: catItems.length,
    };
  });

  return {
    totalBudget,
    totalEstimated,
    totalActual,
    totalPaid,
    remaining: totalBudget - totalActual,
    categories: categoriesWithItems,
  };
}
