Here are the global workflow rules for all modals (upcoming dates, movie series tracker, budget tracker, bucket list, shared tasks):

1. __Instant UI Update:__\
   Whenever an item is added, edited, or deleted, the modal should instantly update its list to reflect the change without requiring a page reload.

2. __Modal Behavior:__

   - Adding an item closes only the add item form, not the modal itself.
   - The user remains in the modal and can immediately see the new item in the list.
   - The modal closes only when the user chooses to close it.

3. __Supabase Sync:__\
   All CRUD operations (add, edit, delete) must update Supabase first, then refresh the modal's data from Supabase to ensure consistency.

4. __Error Handling:__\
   Any errors during CRUD operations should be displayed within the modal, allowing the user to retry or correct input without leaving the modal.

5. __Form Reset:__\
   After a successful add, the form fields are reset to their default values.

6. __No Duplicate Fetches:__\
   Only fetch updated data from Supabase after a successful operation; avoid unnecessary network requests.

7. __Consistent Feedback:__\
   Provide clear feedback (e.g., loading indicators, error messages, success confirmation) for all operations.

These rules ensure a responsive, consistent, and user-friendly experience across all modals.
