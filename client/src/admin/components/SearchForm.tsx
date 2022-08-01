type Props = {
  categoryArr1: {
    value: string;
    name: string;
    id?: string;
  }[];
  categoryArr2?: string[];
  extraCategory?: boolean;
  searchWord: string;
  setSearchWord: React.Dispatch<React.SetStateAction<string>>;
  searchHandleing: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  categoryHandleing1: (value: string, id?: string) => Promise<void>;
  categoryHandleing2?: (value: string) => Promise<void>;
};

function SearchForm(props: Props) {
  const {
    categoryArr1,
    categoryArr2,
    extraCategory,
    searchWord,
    setSearchWord,
    searchHandleing,
    categoryHandleing1,
    categoryHandleing2,
  } = props;

  return (
    <div className="search-wrapper">
      <select
        className="category"
        name="searchCategory"
        onChange={(e) => {
          categoryHandleing1(
            e.target.value,
            e.target[e.target.selectedIndex].id
          );
        }}
      >
        {categoryArr1.map((category) => {
          if (category.id !== "default") {
            return (
              <option value={category.value} id={category.id}>
                {category.name}
              </option>
            );
          } else {
            return (
              <option selected value={category.value} id={category.id}>
                {category.name}
              </option>
            );
          }
        })}
      </select>
      {extraCategory && categoryHandleing2 && categoryArr2 && (
        <select
          className="category"
          name="searchCategory"
          onChange={(e) => categoryHandleing2(e.target.value)}
        >
          <option value="" selected></option>
          {categoryArr2.map((category) => {
            return <option value={category}>{category}</option>;
          })}
        </select>
      )}
      <form className="search-form" onSubmit={searchHandleing}>
        <input
          className="search-input"
          type="text"
          autoFocus
          value={searchWord}
          onChange={(e) => {
            setSearchWord(e.target.value);
          }}
        />
        <button className="search-btn" type="submit">
          검색
        </button>
      </form>
    </div>
  );
}

export default SearchForm;
