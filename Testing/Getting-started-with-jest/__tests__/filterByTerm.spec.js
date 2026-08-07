const filterByTerm = require("../src/filterByTerm");

describe("filterByTerm", () => {

  const input = [
    { id: 1, url: "https://www.url1.dev" },
    { id: 2, url: "https://www.url2.dev" },
    { id: 3, url: "https://www.link3.dev" }
  ];

  test("returns only items whose URL contains the search term", () => {
    
    const output = [{ id: 3, url: "https://www.link3.dev" }];
    
    expect(filterByTerm(input, "link")).toEqual(output);

  });

  test("matches case-insensitively", () => {
    
    const output = [{ id: 3, url: "https://www.link3.dev" }];

    expect(filterByTerm(input, "LINK")).toEqual(output);

  });

  test("matches partial substrings", () => {
    
    const output = [
      { id: 1, url: "https://www.url1.dev" },
      { id: 2, url: "https://www.url2.dev" }
    ];

    expect(filterByTerm(input, "uRl")).toEqual(output);

  });

  test("it should throw when searchTerm is empty string", () => {
    
    const output = "searchTerm cannot be empty";
    
    expect(() => filterByTerm(input, "")).toThrow(output);
  });

  test("it should throw when inputArr is empty", () => {

    const output = "inputArr cannot be empty";

    expect(() => filterByTerm([], "link")).toThrow(output);
  });

});
