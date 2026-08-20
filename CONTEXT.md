# Black Desert Scraped Catalog

This context describes the final item and recipe data products assembled by Calpheon Labs from decoded Black Desert client data.

## Language

**Dataset**:
One internally consistent item-and-recipe catalog produced from a single client capture.
_Avoid_: Import, dump, latest data

**Item family**:
The canonical item identity shared by all of its represented enhancement levels.
_Avoid_: Item row, item variant

**Item enhancement**:
One item family at one exact enhancement level.
_Avoid_: Item when the enhancement level matters

**Recipe catalog**:
The complete scraped result containing actionable recipes, workshop facilities, nameable crafted items, and mastery breakpoints.
_Avoid_: Recipe list

**Recipe**:
An actionable transformation with ingredients and locally known products, specialized as a utensil formula, Processing recipe, or worker production recipe.
_Avoid_: Formula when referring to all recipe kinds

**Utensil formula**:
A Cooking or Alchemy recipe identified by its profession and exact order-independent ingredient multiset.
_Avoid_: Worker recipe, Processing recipe

**Known product**:
An item locally proven to be associated with a recipe result selector or utensil formula, without implying probability, guarantee, role, or completeness.
_Avoid_: Guaranteed result, complete result

**Server-defined quantity**:
A product quantity selected by server-owned rules that are absent from the captured client data.
_Avoid_: Unknown quantity, quantity one

**Workshop facility**:
A worker-production facility whose five tiers select recipes and may require upgrades or guild skills.
_Avoid_: Workshop placement, worker recipe

**Workshop placement**:
The relationship that makes one worker production recipe available at one workshop facility tier.
_Avoid_: Workshop facility

**Mastery breakpoint**:
The minimum mastery value at which a specific Processing, Cooking, or Alchemy effect row applies.
_Avoid_: Mastery level
