# Spending Tracker — CSV Import Format

This document fully specifies the CSV format accepted by the spending tracker's "Import Transactions (CSV)" feature. It is written so that an AI (or any automated tool) can generate a valid import file without guessing.

---

## 1. File Requirements

| Property | Value |
|---|---|
| File extension | `.csv` |
| Encoding | UTF-8 (required — emoji in category names need UTF-8) |
| Line endings | `\r\n` (Windows) or `\n` (Unix) — both accepted |
| First row | **Header row** — must be present, must match column names exactly |
| Subsequent rows | One transaction per row |
| Minimum rows | At least 1 data row (not counting the header) |

---

## 2. Column Definitions

The header row must contain exactly these column names (case-insensitive, order does not matter):

```
date,description,category,amount,type,notes
```

### `date` — **Required**

- Format: `YYYY-MM-DD` (ISO 8601 date, no time component)
- Examples: `2026-06-01`, `2026-12-31`
- Must be a valid calendar date
- Invalid: `06/01/2026`, `June 1 2026`, `2026-6-1`

### `description` — **Required**

- Free text, up to any reasonable length
- Cannot be empty or whitespace-only
- If the value contains a comma, wrap the entire field in double-quotes: `"Coffee, pastry"`
- If the value contains a double-quote, escape it as two double-quotes: `"He said ""hello"""`

### `category` — **Required**

- Must exactly match one of the category names configured in the app (including emoji prefix)
- Category names are case-sensitive and emoji-sensitive
- If a category does not exist in the app, the row is still imported but will not appear in any budget calculation until a matching category is created
- Default category names (copy exactly, including emoji):
  - `🏠 Housing/Rent`
  - `🚗 Transportation`
  - `🛒 Groceries`
  - `🍔 Dining Out`
  - `💡 Utilities`
  - `📱 Subscriptions`
  - `🏥 Health/Medical`
  - `👗 Clothing`
  - `🎉 Entertainment`
  - `🎓 Education`
  - `🐾 Pet Care`
  - `🏋️ Fitness`
  - `✈️ Travel/Vacation`
  - `🎁 Gifts`
  - `💼 Business/Work`
  - `🧴 Personal Care`
  - `🏡 Home/Decor`
  - `📦 Other`

### `amount` — **Required**

- A positive decimal number representing the absolute value of the transaction
- **Always positive** — the `type` field determines whether it's money in or out
- Do not include a currency symbol (`$`), commas, or parentheses
- Up to 2 decimal places recommended; more are accepted but stored as-is
- Examples: `67.42`, `500`, `9.5`, `1500.00`
- Invalid: `-45.00`, `$67.42`, `1,500.00`

### `type` — **Required**

- Exactly one of two values (case-sensitive):
  - `Expense` — money spent (outflow). Shown with a minus sign in the UI.
  - `Income` — money received (inflow). Shown with a plus sign in the UI.
- Invalid: `expense`, `EXPENSE`, `debit`, `credit`, `Spending`

### `notes` — **Optional**

- Free text, may be empty
- If omitted from the row entirely, treated as empty string
- Same quoting rules as `description`

---

## 3. Quoting Rules (RFC 4180)

- Fields may optionally be wrapped in double-quotes: `"value"`
- Fields **must** be wrapped in double-quotes if they contain:
  - A comma: `"Whole Foods, weekly run"`
  - A double-quote (escape as `""`): `"He said ""hi"""`
  - A newline (avoid if possible)
- Do not use single quotes for quoting

---

## 4. Example File

```csv
date,description,category,amount,type,notes
2026-06-01,Whole Foods run,🛒 Groceries,67.42,Expense,Weekly shop
2026-06-01,Gas station,🚗 Transportation,45.00,Expense,
2026-06-02,Chipotle lunch,🍔 Dining Out,13.75,Expense,
2026-06-02,Netflix,📱 Subscriptions,15.99,Expense,Monthly
2026-06-03,Freelance payment,📦 Other,500.00,Income,Client project
2026-06-03,Coffee & pastry,🍔 Dining Out,9.50,Expense,
2026-06-04,Electric bill,💡 Utilities,88.00,Expense,
2026-06-04,Amazon - phone case,📦 Other,19.99,Expense,
2026-06-05,Gym membership,🏋️ Fitness,45.00,Expense,Monthly
2026-06-05,Happy hour drinks,🍔 Dining Out,28.00,Expense,With coworkers
```

---

## 5. Import Behavior

When you import a CSV file the app will:

1. Parse and validate every row before importing anything
2. Display any validation errors with the row number — the entire import is blocked until errors are fixed
3. Warn (but not block) if a category name is unrecognized
4. Ask whether to **Merge** or **Replace**:
   - **Merge**: new rows are added alongside existing transactions. Rows whose generated ID already exists in the app are skipped (deduplication only applies to JSON round-trips; CSV always generates fresh IDs, so merging a CSV twice will create duplicates — avoid importing the same file more than once)
   - **Replace**: all existing transactions are deleted and replaced with the CSV rows. Categories and settings are preserved.

---

## 6. Validation Rules (what the importer checks)

| Field | Rule | Error |
|---|---|---|
| `date` | Present and matches `YYYY-MM-DD` | "date must be YYYY-MM-DD format" |
| `description` | Non-empty after trimming | "description is required" |
| `category` | Present | "category is required" |
| `amount` | Present, parses as a number, > 0 | "amount must be a positive number" |
| `type` | Exactly `Expense` or `Income` | "type must be Expense or Income" |

Rows with errors are skipped. Valid rows are still available to import.

---

## 7. Common Mistakes to Avoid

- **Negative amounts**: store `45.00` not `-45.00`; use `type=Expense` to indicate outflow
- **Wrong type capitalization**: `Expense` and `Income` are capitalized; `expense` will be rejected
- **Currency symbols in amount**: `$45.00` will fail; use `45.00`
- **Missing emoji in category**: `Groceries` will not match `🛒 Groceries`
- **Wrong date format**: `06/01/2026` will fail; use `2026-06-01`
- **Importing the same CSV twice with Merge**: CSV import always generates new IDs, so duplicates will be created

---

## 8. Generating a CSV with an AI

If you are asking an AI assistant to generate a CSV for import, provide this prompt:

> Generate a CSV of spending transactions using this exact format:
> - Header row: `date,description,category,amount,type,notes`
> - `date`: YYYY-MM-DD
> - `description`: plain text
> - `category`: must be one of the exact names listed in the CSV_IMPORT_FORMAT.md (including emoji)
> - `amount`: positive decimal, no $ sign
> - `type`: exactly `Expense` or `Income`
> - `notes`: optional plain text
>
> Do not add extra columns, do not add a $ sign to amounts, do not use negative numbers.
