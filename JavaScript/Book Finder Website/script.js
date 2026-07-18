// Click handler for search button
const captureSearchValue = () => {
    return document.getElementById("search-bar").value;
};

// Filter books based on search input
const filterBooks = (searchString, bookList) => {
    return bookList.filter(book => flattenObjectValuesIntoArray([book])[0].includes(searchString));
};

// Empty the book list container, iterate over list of filtered books, return list of books formatted as HTML using the function in `helper.js` 
const structureBooksAsHtml = (filteredBooks) => {
    const bookListContainer = document.querySelector("#bookList");
    bookListContainer.innerHTML = "";
    return filteredBooks.map(book => structureBookAsHtml(book));
};

// Handler triggered when a user clickers the "Search" button. Chains previously defined functions together to filter books based on the search value, formats the books as HTML and renders them to the DOM
const searchBtnClickHandler = (bookList) => {
    const searchValue = captureSearchValue();
    const filteredBooks = filterBooks(searchValue, bookList);
    renderBooksToDom(structureBooksAsHtml(filteredBooks));
}

// Grab search button from the DOM
const searchBtn = document.getElementById("search-btn");

// Attach an event listener to the search button
searchBtn.addEventListener("click", () => { searchBtnClickHandler(books) });