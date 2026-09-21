-- Run once as the PostgreSQL database owner or a superuser.
GRANT CONNECT ON DATABASE ecommerce_test TO ecom_api_user;
GRANT USAGE, CREATE ON SCHEMA public TO ecom_api_user;