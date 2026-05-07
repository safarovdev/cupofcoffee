'use server';
/**
 * @fileOverview An AI-powered Dietary Companion that analyzes selected menu items against a customer's dietary restrictions.
 *
 * - dietaryCompanion - A function that handles the dietary analysis process.
 * - DietaryCompanionInput - The input type for the dietaryCompanion function.
 * - DietaryCompanionOutput - The return type for the dietaryCompanion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DietaryCompanionInputSchema = z.object({
  selectedItems: z.array(
    z.object({
      name: z.string().describe('The name of the menu item.'),
      ingredients: z.array(z.string()).describe('A list of ingredients in the menu item. Example: ["Milk", "Coffee", "Sugar"]'),
    })
  ).describe('The list of menu items selected by the customer, including their names and ingredients.'),
  dietaryRestrictions: z.string().describe('A string describing the customer\u0027s dietary restrictions and preferences (e.g., "peanut allergy, vegan", "gluten-free", "no dairy").'),
});
export type DietaryCompanionInput = z.infer<typeof DietaryCompanionInputSchema>;

const DietaryCompanionOutputSchema = z.object({
  issuesFound: z.boolean().describe('True if any dietary restriction conflicts or potential issues were found, otherwise false.'),
  analysis: z.string().describe('A detailed explanation of any potential issues, conflicts, or important information regarding the selected items and dietary restrictions. If no issues, state that the items are compatible.'),
  suggestions: z.string().describe('Personalized suggestions for alternative items, modifications to existing items, or advice to ensure dietary compliance. If no issues, offer general recommendations.'),
});
export type DietaryCompanionOutput = z.infer<typeof DietaryCompanionOutputSchema>;

export async function dietaryCompanion(input: DietaryCompanionInput): Promise<DietaryCompanionOutput> {
  return dietaryCompanionFlow(input);
}

const dietaryCompanionPrompt = ai.definePrompt({
  name: 'dietaryCompanionPrompt',
  input: { schema: DietaryCompanionInputSchema },
  output: { schema: DietaryCompanionOutputSchema },
  prompt: `You are an AI-powered Dietary Companion for a cafe named AromaFlow. Your goal is to help customers with dietary restrictions make informed choices from the menu.
Analyze the provided selected menu items and the customer's dietary restrictions.
Identify any potential conflicts, issues, or important considerations.
Provide a clear analysis and actionable suggestions for alternatives or modifications to ensure the customer's dietary needs are met.

Follow these instructions strictly:
1.  Act as a helpful and knowledgeable dietary expert.
2.  Thoroughly review each selected item's ingredients against the customer's stated restrictions.
3.  If no issues are found, clearly state that the selected items appear compatible with the restrictions and offer general healthy eating tips if applicable, setting \u0060issuesFound\u0060 to \u0060false\u0060.
4.  If issues are found, set \u0060issuesFound\u0060 to \u0060true\u0060.
5.  For \u0060analysis\u0060, describe each issue clearly, mentioning the item and the conflicting ingredient/restriction.
6.  For \u0060suggestions\u0060, provide specific, practical advice. This could include:
    -   Alternative menu items (if you know common cafe offerings that fit the restrictions, e.g., "Instead of the regular latte, consider an oat milk latte").
    -   Modifications to the selected item (e.g., "Request your sandwich without cheese if you are dairy-free").
    -   General advice on ordering (e.g., "Always confirm ingredients with staff for severe allergies").

Selected Menu Items:
{{#each selectedItems}}
  - Name: {{{name}}}
    Ingredients: {{#each ingredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Customer's Dietary Restrictions: {{{dietaryRestrictions}}}`,
});

const dietaryCompanionFlow = ai.defineFlow(
  {
    name: 'dietaryCompanionFlow',
    inputSchema: DietaryCompanionInputSchema,
    outputSchema: DietaryCompanionOutputSchema,
  },
  async (input) => {
    const { output } = await dietaryCompanionPrompt(input);
    return output!;
  }
);
