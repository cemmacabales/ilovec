-- The app talks to the REST API only. Without pg_graphql, the table list
-- isn't discoverable through /graphql/v1 by any signed-in account.
drop extension if exists pg_graphql;
