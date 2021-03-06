//we are using Mobx@v4 to support internet explorer, because Mobx@v5 is using Proxy API
import { observable, autorun, makeAutoObservable, configure , reaction, when} from "mobx";
import { computedFn } from "mobx-utils";
configure({ enforceActions: "never" });
class EmployeeStore {
  employees = [];
  loading = false;
  adding = false;
  constructor() {
    makeAutoObservable(
      this,
      {
        employees: observable.shallow,
      },
      { autoBind: true }
    );
    this.fetch();
    autorun(() => {
      debugger
      console.log(`From Store : ${this.employees.length}`);
    });
    reaction(()=>this.getTotal,(length)=>{
      debugger
    });
    when(()=>this.getTotal,()=>{
      debugger
    });
  }
  get getEmployees() {
    return this.employees;
  }
  get getLoading() {
    return this.loading;
  }
  get getAdding() {
    return this.adding;
  }
  get getTotal() {
    return this.employees.length;
  }
  get getExists() {
    return this.employees.filter((emp) => {
      return emp.exist === true;
    }).length;
  }
  get getNotExists() {
    return this.employees.filter((emp) => {
      return emp.exist === false;
    }).length;
  }
  searchWithTerm = computedFn((term) => {
    const $term = term.toLowerCase();
    return this.employees.filter((emp) => {
      return emp.name.toLowerCase().includes($term);
    }).length;
  });
  *fetch() {
    try {
      this.loading = true;
      const response = yield fetch("http://localhost:4000/employees");
      const employees = yield response.json();
      this.employees = employees;
      this.loading = false;
    } catch (error) {
      console.error(error);
    }
  }
  addEmployee(employee) {
    this.adding = true;
    fetch("http://localhost:4000/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        this.adding = false;
        this.employees.push(response);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  deleteEmployee(employee) {
    fetch(`http://localhost:4000/employees/${employee.id}`, {
      method: "DELETE",
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        this.employees = this.employees.filter((emp) => {
          return emp.id !== employee.id;
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }
  setChecked(employee) {
    const currentEmployee = this.employees.find((emp) => {
      return emp.id === employee.id;
    });
    currentEmployee.exist = !employee.exist;
    currentEmployee.id = employee.id;
    currentEmployee.name = employee.name;
    fetch(`http://localhost:4000/employees/${employee.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentEmployee),
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        const index = this.employees.findIndex((emp) => {
          return emp.id === employee.id;
        });
        this.employees[index] = response;
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
export default EmployeeStore;
