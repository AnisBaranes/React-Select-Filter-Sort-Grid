import React from "react";
import styled from "styled-components";
import {
  useTable,
  useBlockLayout,
  usePagination,
  useSortBy,
  useFilters,
  useGlobalFilter,
  useRowSelect
} from "react-table";
import { useSticky } from "react-table-sticky";
import makeData from "./makeData";
import axios from "axios";

const Styles = styled.div`
  display: block;
  max-width: 100%;
  padding: 1rem;

  .tableView {
    width: 100%;
    display: block;
    max-width: 100%;
    overflow-x: scroll;
    overflow-y: hidden;
    padding-right: 2px;
    direction: rtl;
  }

  .table {
    border: 1px solid #f0f0f0;
    width: 100%;

    .th {
      padding: 4px;
      /* margin:10px; */
      border-bottom: 1px solid #f0f0f0;
      /* border-right: 1px solid #f0f0f0; */
      background-color: #fafafa;
      overflow: hidden;
      color: #000000d9;
      font-weight: 500;
      font-size: 15px;

      .thColumn {
        border-right: 1px solid #dcdcdc;
        padding-right: 0.5rem;
        /* padding-left: 0.5rem; */
        display: flex;
        justify-content: center;
        align-content: center;
        align-items: center;
        flex-direction: column;
        flex-wrap: wrap;
      }
    }

    .td {
      /* padding: 5px; */
      padding-top: 7px;
      padding-bottom: 7px;
      padding-left: 3px;
      border-bottom: 1px solid #f0f0f0;
      /* border-right: 1px solid #ddd; */
      background-color: #fff;
      overflow: hidden;
      position: relative;
      /* padding: 16px; */
      overflow-wrap: break-word;

      text-align: center;
      font-size: 14px;

      :last-child {
        border-right: 0;
      }

      &.selected {
        background: lightgreen;
      }

      .resizer {
        display: inline-block;
        width: 5px;
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(50%);
        z-index: 1;

        &.isResizing {
          background: red;
        }
      }
    }

    &.sticky {
      .header,
      .footer {
        position: sticky;
        z-index: 1;
        width: fit-content;
      }

      .header {
        top: 0;
        /* box-shadow: 0px 3px 3px #ccc; */
        /* border-bottom: 1px solid #f0f0f0 */
      }

      .footer {
        bottom: 0;
        /* box-shadow: 0px -3px 3px #ccc; */
        border-top: 1px solid #f0f0f0;
      }

      .body {
        position: relative;
        z-index: 0;
      }

      [data-sticky-td] {
        position: sticky;
      }

      [data-sticky-last-left-td] {
        box-shadow: 2px 0px 3px #f0f0f0;
        display: flex;
        justify-content: center;
        align-items: center;
        align-content: center;
        padding-right: 5px;
      }

      [data-sticky-first-right-td] {
        box-shadow: -2px 0px 3px #f0f0f0;
        display: flex;
        justify-content: center;
        align-items: center;
        align-content: center;
      }
    }
  }
`;

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter }
}) {
  return (
    <input
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={"חיפוש"}
      style={{ width: "95%" }}
    />
  );
}

// Be sure to pass our updateMyData and the skipReset option
function Table({ columns, data, isSelection }) {
  const filterTypes = React.useMemo(
    () => ({
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      }
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 120,
      maxWidth: 400,
      Filter: DefaultColumnFilter
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setAllFilters,
    state: { pageIndex, pageSize, selectedRowIds }
  } = useTable(
    {
      columns,
      data,
      defaultColumn, // Be sure to pass the defaultColumn option
      filterTypes,
      isSelection
    },
    useGlobalFilter,
    useFilters, // useFilters!
    useSortBy,
    usePagination,
    useBlockLayout,
    useSticky,
    useRowSelect,
    (hooks) => {
      if (isSelection === true) {
        hooks.visibleColumns.push((columns) => [
          // Let's make a column for selection
          {
            id: "selection",
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Header: ({ getToggleAllRowsSelectedProps }) => (
              <div>
                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
              </div>
            ),
            // The cell can use the individual row's getToggleRowSelectedProps method
            // to the render a checkbox
            Cell: ({ row }) => (
              <div>
                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
              </div>
            ),
            sticky: "left",
            width: 30
          },
          ...columns
        ]);
      }
    }
  );

  // Workaround as react-table footerGroups doesn't provide the same internal data than headerGroups
  // const footerGroups = headerGroups.slice().reverse();

  return (
    <Styles>
      <button onClick={() => setAllFilters([])}>ניקוי שדות חיפוש</button>
      <div className="tableView">
        <div {...getTableProps()} className="table sticky">
          <div className="header">
            {headerGroups.map((headerGroup) => (
              <div {...headerGroup.getHeaderGroupProps()} className="tr">
                {headerGroup.headers.map((column) => (
                  <div {...column.getHeaderProps()} className="th">
                    <div
                      className={
                        column.id !== "selection" && column.id !== "actions"
                          ? "thColumn"
                          : null
                      }
                    >
                      <span
                        {...column.getSortByToggleProps()}
                        style={{ paddingBottom: "0.5rem" }}
                      >
                        {column.render("Header")}
                        {/* {console.log("column",column)} */}
                        {/* Add a sort direction indicator */}
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                      {/* Render the columns filter UI */}
                      <div>
                        {column.canFilter ? column.render("Filter") : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div {...getTableBodyProps()} className="body">
            {page.map((row, i) => {
              const { isSelected } = row;
              const changeClassName =
                isSelected === true ? "td selected" : "td";
              prepareRow(row);
              return (
                <div
                  // onClick={(e) =>
                  //   console.log("onClick", e, row, row.toggleRowSelected(true))
                  // }
                  {...row.getRowProps()}
                  // style={customStyle}
                  className="tr"
                >
                  {row.cells.map((cell) => {
                    return (
                      <div
                        {...cell.getCellProps()}
                        // style={customStyle}
                        className={changeClassName}
                      >
                        {cell.render("Cell")}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        {/*
        Pagination can be built however you'd like.
        This is just a very basic UI implementation:
      */}
        <div className="pagination">
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {"<<"}
          </button>{" "}
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {"<"}
          </button>{" "}
          {/* <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "} */}
          <span>
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{" "}
          </span>
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            {">"}
          </button>{" "}
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            {">>"}
          </button>{" "}
          <span>
            | Go to page:{" "}
            <input
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              style={{ width: "100px" }}
            />
          </span>{" "}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                תציג {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p dir="rtl">מספר רשומות שנבחרו: {Object.keys(selectedRowIds).length}</p>
    </Styles>
  );
}

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  }
);

function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: " ",
        columns: [
          {
            Header: "מס' מזהה",
            accessor: "id"
          },
          {
            Header: "שם פרטי",
            accessor: "firstName"
          },
          {
            Header: "שם משפחה",
            accessor: "lastName"
          },
          {
            Header: "ת.לידה",
            accessor: "birthday"
          },
          {
            Header: "שם הורה 1",
            accessor: "parent1"
          },
          {
            Header: "שם הורה 2",
            accessor: "parent2"
          },
          {
            Header: "כתובת",
            accessor: "address"
          },
          {
            Header: "סוג חינוך",
            accessor: "educationType"
          },
          {
            Header: "קישור",
            accessor: "link"
          }
        ]
      },
      {
        Header: "שנה''ל נוכחית",
        columns: [
          {
            Header: "רישום/שיבוץ",
            accessor: "registration"
          },
          {
            Header: "מוסד",
            accessor: "instatuation"
          },
          {
            Header: "כיתה",
            accessor: "class"
          },
          {
            Header: "ת.יציאה",
            accessor: "exitDate"
          },
          {
            Header: "סיבת יציאה",
            accessor: "exitReason"
          }
        ]
      },
      {
        Header: "שנה''ל הבאה",
        columns: [
          {
            Header: "רישום/שיבוץ",
            accessor: "registrationNextYear"
          },
          {
            Header: "מוסד",
            accessor: "instatuationNextYear"
          },
          {
            Header: "כיתה",
            accessor: "classNextYear"
          }
        ]
      }
    ],
    []
  );

  const data = React.useMemo(() => makeData(100), []);

  const dataJson = function componentDidMount() {
    axios.get(`https://jsonplaceholder.typicode.com/users`).then((res) => {
      const persons = res.data;
      //this.setState({ persons });
      console.log(persons);
    });
  };

  return (
    <Table
      dir="rtl"
      columns={columns}
      data={data}
      isSelection={true}
      isCard={true}
    />
  );
}

export default App;
