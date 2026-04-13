(function () {
  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function makeQuestion(id, question, options, answer) {
    const shuffled = shuffle(options);
    return {
      id,
      question,
      options: shuffled,
      answerIndex: shuffled.indexOf(answer)
    };
  }

  const foundational = [
    { q: "Which keyword is used to create a subclass in Java?", a: "extends", o: ["extends", "inherits", "implements", "super"] },
    { q: "Which method is the entry point of a Java application?", a: "main", o: ["main", "start", "run", "init"] },
    { q: "Which package is automatically imported in every Java file?", a: "java.lang", o: ["java.lang", "java.util", "java.io", "java.net"] },
    { q: "Which access modifier allows visibility only inside the same class?", a: "private", o: ["private", "public", "protected", "default"] },
    { q: "Which collection does not allow duplicate elements?", a: "Set", o: ["Set", "List", "Queue", "ArrayList"] },
    { q: "Which keyword prevents a method from being overridden?", a: "final", o: ["final", "static", "const", "sealed"] },
    { q: "What does JVM stand for?", a: "Java Virtual Machine", o: ["Java Virtual Machine", "Java Variable Method", "Joint Virtual Manager", "Java Vendor Module"] },
    { q: "Which exception is unchecked?", a: "NullPointerException", o: ["NullPointerException", "IOException", "SQLException", "ClassNotFoundException"] },
    { q: "Which statement is used for decision-making in Java?", a: "if", o: ["if", "loop", "switcher", "choose"] },
    { q: "Which interface supports functional-style operations like map/filter?", a: "Stream", o: ["Stream", "Iterator", "Collection", "Scanner"] },
    { q: "What is method overloading?", a: "Same method name with different parameters", o: ["Same method name with different parameters", "Same method in parent and child", "Changing return type only", "Declaring method private"] },
    { q: "Which keyword is used to implement an interface?", a: "implements", o: ["implements", "extends", "inherits", "realizes"] },
    { q: "Which loop is guaranteed to execute at least once?", a: "do-while", o: ["do-while", "while", "for", "enhanced for"] },
    { q: "What does JDK include that JRE does not?", a: "Development tools like javac", o: ["Development tools like javac", "JVM", "Core libraries", "Garbage collector"] },
    { q: "Which class is used to read text from console?", a: "Scanner", o: ["Scanner", "Printer", "ConsoleReader", "Input"] },
    { q: "What is encapsulation?", a: "Bundling data and methods with controlled access", o: ["Bundling data and methods with controlled access", "Inheriting fields from parent", "Converting source to bytecode", "Handling multiple threads"] },
    { q: "Which annotation marks a Spring Boot main class?", a: "@SpringBootApplication", o: ["@SpringBootApplication", "@EnableWeb", "@MainClass", "@BootConfig"] },
    { q: "Which HTTP method is commonly used for creating data in REST?", a: "POST", o: ["POST", "GET", "PUT", "DELETE"] },
    { q: "What is the default value of an int field in Java class?", a: "0", o: ["0", "null", "1", "undefined"] },
    { q: "Which operator compares object references?", a: "==", o: ["==", ".equals()", "!=", "instanceof"] },
    { q: "Which interface allows sorting with custom logic?", a: "Comparator", o: ["Comparator", "Comparable", "Iterable", "Serializable"] },
    { q: "Which map implementation preserves insertion order?", a: "LinkedHashMap", o: ["LinkedHashMap", "HashMap", "TreeMap", "Hashtable"] },
    { q: "What does dependency injection improve?", a: "Loose coupling", o: ["Loose coupling", "Faster network speed", "Lower RAM only", "Automatic UI rendering"] },
    { q: "Which SQL operation retrieves data?", a: "SELECT", o: ["SELECT", "INSERT", "UPDATE", "DROP"] },
    { q: "Which Spring stereotype is used for REST endpoints?", a: "@RestController", o: ["@RestController", "@Service", "@Component", "@Repository"] }
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
    ["Bean", "Object managed by Spring container", ["Compiled .class file", "SQL column", "Network socket"]],
    ["Repository", "Spring component for data access layer", ["UI template", "Logging framework", "Static resource folder"]],
    ["Service", "Spring layer containing business logic", ["Database table", "HTTP status", "Template engine"]],
    ["Controller", "Spring layer that handles web requests", ["Database driver", "JVM option", "Build lifecycle"]],
    ["DTO", "Object used to transfer data between layers", ["Thread pool", "Garbage collector", "Servlet container"]],
    ["Immutable Object", "Object whose state cannot change after creation", ["Object with public fields", "Any array", "A synchronized block"]],
    ["Enum", "Type with a fixed set of constants", ["Dynamic list", "Database migration", "Package visibility"]],
    ["Stream API", "Functional operations on collections", ["Socket streaming only", "Servlet mapping", "Class loading"]],
    ["Reflection", "Inspecting classes and methods at runtime", ["Compiling source code", "Rendering HTML", "Managing SQL indexes"]],
    ["Serialization", "Converting object state to byte stream", ["Running SQL queries", "Building CSS", "Locking threads"]],
    ["Deserialization", "Reconstructing object from byte stream", ["Encrypting password", "Creating REST route", "Closing socket"]],
    ["JPA", "Specification for object-relational mapping in Java", ["A web browser", "A logging API", "A Java compiler"]],
    ["Hibernate", "Popular JPA implementation", ["An HTTP method", "A JVM flag", "A template engine"]],
    ["Transaction", "Unit of work that should be all-or-nothing", ["UI theme setting", "Thread sleep call", "Dependency scope"]],
    ["Annotation", "Metadata added to Java code", ["Database row", "Compiled jar", "Web socket"]],
    ["Package", "Namespace for organizing related classes", ["A constructor call", "A static variable", "A SQL transaction"]],
    ["Jar File", "Archive that packages Java classes and resources", ["A browser plugin", "An HTTP response", "An IDE workspace"]],
    ["Classpath", "Location list used by JVM to find classes", ["List of SQL tables", "HTTP route map", "Git branch history"]],
    ["Unit Testing", "Testing individual components in isolation", ["Deploying to production", "Monitoring CPU only", "Migrating database"]],
    ["Mocking", "Replacing dependencies with test doubles", ["Encrypting API keys", "Building containers", "Compiling bytecode"]]
  ];

  const generated = [];
  let idCounter = 1;

  foundational.forEach((item) => {
    generated.push(makeQuestion(idCounter++, item.q, item.o, item.a));
  });

  concepts.forEach(([topic, correct, wrong]) => {
    const baseOptions = [correct, ...wrong];
    generated.push(makeQuestion(idCounter++, `What best describes ${topic} in Java?`, baseOptions, correct));
    generated.push(makeQuestion(idCounter++, `Choose the correct definition of ${topic}.`, baseOptions, correct));
    generated.push(makeQuestion(idCounter++, `${topic} is mainly used for what purpose?`, baseOptions, correct));
  });

  window.QUESTION_BANK = generated.slice(0, 100);
})();
