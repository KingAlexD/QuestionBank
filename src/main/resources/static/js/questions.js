(function () {
  const categories = ["Core Java", "OOP", "Collections", "Multithreading"];
  const difficulties = ["easy", "medium", "hard"];

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function makeQuestion(id, question, options, answer, category, difficulty, explanation) {
    return { id, question, options: [...options], answer, category, difficulty, explanation };
  }

  const foundational = [
    ["Which keyword is used to create a subclass in Java?", ["extends", "inherits", "implements", "super"], "extends"],
    ["Which method is the entry point of a Java application?", ["main", "start", "run", "init"], "main"],
    ["Which package is automatically imported in every Java file?", ["java.lang", "java.util", "java.io", "java.net"], "java.lang"],
    ["Which access modifier allows visibility only inside the same class?", ["private", "public", "protected", "default"], "private"],
    ["Which collection does not allow duplicate elements?", ["Set", "List", "Queue", "ArrayList"], "Set"],
    ["Which keyword prevents a method from being overridden?", ["final", "static", "const", "sealed"], "final"],
    ["What does JVM stand for?", ["Java Virtual Machine", "Java Variable Method", "Joint Virtual Manager", "Java Vendor Module"], "Java Virtual Machine"],
    ["Which exception is unchecked?", ["NullPointerException", "IOException", "SQLException", "ClassNotFoundException"], "NullPointerException"],
    ["Which statement is used for decision-making in Java?", ["if", "loop", "switcher", "choose"], "if"],
    ["Which interface supports functional-style operations like map/filter?", ["Stream", "Iterator", "Collection", "Scanner"], "Stream"],
    ["What is method overloading?", ["Same method name with different parameters", "Same method in parent and child", "Changing return type only", "Declaring method private"], "Same method name with different parameters"],
    ["Which keyword is used to implement an interface?", ["implements", "extends", "inherits", "realizes"], "implements"],
    ["Which loop is guaranteed to execute at least once?", ["do-while", "while", "for", "enhanced for"], "do-while"],
    ["What does JDK include that JRE does not?", ["Development tools like javac", "JVM", "Core libraries", "Garbage collector"], "Development tools like javac"],
    ["Which class is used to read text from console?", ["Scanner", "Printer", "ConsoleReader", "Input"], "Scanner"],
    ["What is encapsulation?", ["Bundling data and methods with controlled access", "Inheriting fields from parent", "Converting source to bytecode", "Handling multiple threads"], "Bundling data and methods with controlled access"],
    ["Which annotation marks a Spring Boot main class?", ["@SpringBootApplication", "@EnableWeb", "@MainClass", "@BootConfig"], "@SpringBootApplication"],
    ["Which HTTP method is commonly used for creating data in REST?", ["POST", "GET", "PUT", "DELETE"], "POST"],
    ["What is the default value of an int field in Java class?", ["0", "null", "1", "undefined"], "0"],
    ["Which operator compares object references?", ["==", ".equals()", "!=", "instanceof"], "=="]
  ];

  const concepts = [
    ["Polymorphism", "One interface, many implementations", ["No inheritance", "Only compile errors", "Single constructor rule"]],
    ["Abstraction", "Hiding implementation details and showing behavior", ["Always using static methods", "Only public variables", "Avoiding interfaces"]],
    ["Inheritance", "Acquiring properties and behavior from parent class", ["Declaring only private fields", "Using final class", "Runtime compilation"]],
    ["Interface", "A contract of abstract behavior", ["A concrete final class", "A SQL schema", "A JVM thread"]],
    ["Class", "Blueprint for creating objects", ["Compiled bytecode only", "A method parameter", "A database row"]],
    ["Object", "Instance of a class", ["A package name", "A keyword", "A compiler option"]],
    ["Constructor", "Special method used to initialize objects", ["Method returning void only", "Static import tool", "Throwable subtype"]],
    ["Garbage Collection", "Automatic memory cleanup for unreachable objects", ["Manual delete keyword", "SQL optimization", "Thread locking"]],
    ["Exception Handling", "Managing runtime errors using try/catch", ["Compile-time annotation only", "Disabling JVM checks", "Skipping method calls"]],
    ["Multithreading", "Executing multiple threads concurrently", ["Running one statement only", "Disabling CPU cores", "Using one object only"]],
    ["Synchronization", "Controlling concurrent access to shared resources", ["Encrypting passwords", "Avoiding constructors", "Converting types"]],
    ["Lambda Expression", "Concise way to represent functional interfaces", ["A SQL join", "A package statement", "An exception class"]],
    ["Optional", "Container object that may or may not hold a non-null value", ["A map implementation", "A primitive keyword", "A servlet class"]],
    ["Maven", "Build and dependency management tool", ["Database engine", "HTTP server", "IDE plugin only"]],
    ["Spring Boot", "Framework for rapidly building Spring applications", ["Java bytecode format", "Only front-end library", "Operating system"]],
    ["Repository", "Spring component for data access layer", ["UI template", "Logging framework", "Static resource folder"]],
    ["Service", "Spring layer containing business logic", ["Database table", "HTTP status", "Template engine"]],
    ["Controller", "Spring layer that handles web requests", ["Database driver", "JVM option", "Build lifecycle"]],
    ["DTO", "Object used to transfer data between layers", ["Thread pool", "Garbage collector", "Servlet container"]],
    ["Stream API", "Functional operations on collections", ["Socket streaming only", "Servlet mapping", "Class loading"]],
    ["Reflection", "Inspecting classes and methods at runtime", ["Compiling source code", "Rendering HTML", "Managing SQL indexes"]],
    ["Serialization", "Converting object state to byte stream", ["Running SQL queries", "Building CSS", "Locking threads"]],
    ["Deserialization", "Reconstructing object from byte stream", ["Encrypting password", "Creating REST route", "Closing socket"]],
    ["JPA", "Specification for object-relational mapping in Java", ["A web browser", "A logging API", "A Java compiler"]],
    ["Hibernate", "Popular JPA implementation", ["An HTTP method", "A JVM flag", "A template engine"]],
    ["Transaction", "Unit of work that should be all-or-nothing", ["UI theme setting", "Thread sleep call", "Dependency scope"]],
    ["Annotation", "Metadata added to Java code", ["Database row", "Compiled jar", "Web socket"]]
  ];

  const generated = [];
  let idCounter = 1;

  foundational.forEach((item, idx) => {
    const category = categories[idx % categories.length];
    const difficulty = difficulties[idx % difficulties.length];
    generated.push(makeQuestion(
      idCounter++,
      item[0],
      shuffle(item[1]),
      item[2],
      category,
      difficulty,
      `The correct answer is ${item[2]} because it matches Java language behavior.`
    ));
  });

  concepts.forEach((item, idx) => {
    const [topic, correct, wrong] = item;
    const variants = [
      `What best describes ${topic} in Java?`,
      `Choose the correct definition of ${topic}.`,
      `${topic} is mainly used for what purpose?`
    ];

    variants.forEach((q, v) => {
      const category = categories[(idx + v) % categories.length];
      const difficulty = difficulties[(idx + v) % difficulties.length];
      generated.push(makeQuestion(
        idCounter++,
        q,
        shuffle([correct, ...wrong]),
        correct,
        category,
        difficulty,
        `${topic}: ${correct}.`
      ));
    });
  });

  window.QUESTION_BANK = generated.slice(0, 100);
})();
