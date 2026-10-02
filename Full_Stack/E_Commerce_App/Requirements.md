# E_Commerce_App Part Two Minimal Requirements
1. Set up the necessary folders and files for building your React frontend.
2. Set up React Router to be able to navigate between different pages of your app.
3. The registration page should allow the user to create a new account using a username and password. It should also include a link to the login page if the user already has an existing account.
4. The login page should allow the user to sign in using either a username and password or a third-party service of Google, GitHub, and Microsoft. It should also include a link to the register page if the user does not have an existing account.
5. Add the logic for handling login using a third-party service.
6. Leverage backend functionality as initially designed for Part 1. Perform only minimal updates to match the requirements of this document.
7. Enable session support for your application in order to maintain login state.
8. Allow users to log out of their account from any page if they are signed in.
9. The products listing page will be the place for users to browse through the products available for sale. Each product should display a name, description, and image.
10. On each product details page, there should be a button that allows users to add that item to their cart. Keep track of which items have been added to cart.
11. The checkout page should display the current cart items and allow users to complete their purchase using a Stripe integration.
12. Some features on your site should only be accessible after the user logs in, such as the ability to add items to the cart or complete an order. Make sure to redirect users to the login page if they are trying to perform these tasks and are not signed in.
13. Users should be able to access their order history when they are logged in, including details about the order status and purchased items.
14. The application must pass all tests. When functionality was modified according to these requirements, the test will be modified to ensure it can pass when fulfilling these requirements.