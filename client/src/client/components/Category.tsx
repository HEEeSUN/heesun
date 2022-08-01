type Props = {
  categoryItems: {
    name: string;
    value: string;
    selected: boolean;
  }[];
  changeHandler: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

function Category(props: Props) {
  const { categoryItems, changeHandler } = props;

  return (
    <select
      name="sortCategory"
      className="search-category"
      onChange={changeHandler}
    >
      {categoryItems.map((item, key) => {
        return (
          <option value={item.value} selected={item.selected}>
            {item.name}
          </option>
        );
      })}
    </select>
  );
}

export default Category;
