"use client";

import SearchExpandNav from "./search-expand-nav";

export default function SearchExpandNavExample() {
  return (
    <div className="flex flex-col items-center gap-16 pt-24">
      {/* Default "travel" effect: the search icon glides right → left. */}
      <SearchExpandNav onSearch={(query) => console.log("search", query)} user="Ada Lovelace" handle="@ada" />

      {/* "flip" effect: the first icon rises + blurs into the search icon. */}
      <SearchExpandNav effect="flip" />
    </div>
  );
}
