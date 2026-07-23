const CONCEPT_DESCRIPTIONS = {
  "AI": {
    "easy": {
      "Machine Learning": "Algorithms that enable computers to learn from and make predictions based on data.",
      "Natural Language Processing": "Systems that understand, interpret, and process human text and spoken language.",
      "Computer Vision": "Technology designed to extract information and understand digital images and videos.",
      "Deep Learning": "Neural networks with multiple hidden layers that extract complex features from raw inputs.",
      "Generative AI": "AI models trained to create new text, images, or synthetic data matching training distributions.",
      "Reinforcement Learning": "An agent learning optimal sequences of actions in an environment to maximize cumulative rewards.",
      "Supervised Learning": "Training machine learning algorithms using labeled datasets with explicit inputs and targets.",
      "Unsupervised Learning": "Discovering hidden structures, groupings, or dimensions in unlabeled datasets.",
      "Neural Networks": "Interconnected layers of processing nodes mimicking biological brain structures to process parameters.",
      "Expert Systems": "Logical decision engines emulating human logical expertise using a static set of rules."
    },
    "medium": {
      "K-Means Clustering": "Partitioning an unlabeled dataset into K distinct clusters based on minimum distance to centroids.",
      "Support Vector Machines (SVM)": "Finding an optimal hyperplane in a high-dimensional space to maximize classification margin gaps.",
      "Decision Trees": "A structure representing classification paths and decisions based on feature value split thresholds.",
      "Random Forest": "An ensemble method aggregating predictions of multiple decision trees to improve overall stability.",
      "Convolutional Neural Networks (CNN)": "Deep neural networks optimized for visual data using spatial convolution filter matrices.",
      "Recurrent Neural Networks (RNN)": "Sequential neural models tracking temporal dependencies using cyclic feedback connections.",
      "Q-Learning": "A model-free reinforcement learning algorithm finding optimal action policies using state-action values.",
      "Gradient Boosting": "Sequentially building weak prediction models (typically trees) to minimize residual errors.",
      "Principal Component Analysis (PCA)": "Reducing dataset dimensions by transforming variables into orthogonal principal components.",
      "Naive Bayes": "A probabilistic classification algorithm applying Bayes' theorem with conditional independence assumptions."
    },
    "hard": {
      "Vanishing Gradient Problem": "Derivatives approaching zero in deep architectures, stalling updates during backpropagation.",
      "Overfitting": "Models learning training noise and detail too well, failing to generalize to validation data.",
      "Underfitting": "Models being too simple to capture the underlying structure and pattern of training datasets.",
      "Backpropagation": "Calculating the gradient vectors of loss functions sequentially backward through network layers.",
      "Stochastic Gradient Descent (SGD)": "Updating network weight parameters using single-sample or mini-batch gradients.",
      "L1 and L2 Regularization": "Adding penalty parameters (absolute values or squares of weights) to loss functions.",
      "Transformer Self-Attention": "A mechanism mapping global dependencies across inputs by calculating query-key similarity matrices.",
      "Convolution Filter Strides": "The step size a convolution filter matrix shifts when sliding across visual matrices.",
      "LSTM Cell States": "Internal cell registers tracking and gating long-term memory updates across sequential data.",
      "Hyperparameter Tuning": "Optimizing non-trainable configurations like learning rates and batch sizes to maximize scores."
    }
  },
  "HTML": {
    "easy": {
      "<a>": "A standard anchor markup tag used to establish clickable hyperlinks to external or internal targets.",
      "<img>": "An image element tag used to embed visual graphic formats inside webpage document containers.",
      "<div>": "A generic block-level structural container used to group page sections for styling or logical scoping.",
      "<p>": "A block element tag representing structured paragraph text layout on document pages.",
      "<h1>": "A top-level structural header tag used to denote the main page topic or title.",
      "<ul>": "An unordered list container element tag used to present items as bullet points.",
      "<li>": "A list item wrapper tag nested inside ordered or unordered list elements.",
      "<input>": "An interactive form input element allowing users to type texts, choices, or uploads.",
      "<button>": "A clickable interactive element tag designed to execute scripts or submit forms.",
      "<form>": "A block container enclosing interactive inputs to package and submit user datasets to servers."
    },
    "medium": {
      "placeholder": "A temporary grayed-out hint text displayed inside empty inputs until characters are entered.",
      "required": "A validation attribute enforcing that a form cannot submit unless the input is completed.",
      "disabled": "A boolean state attribute preventing any user interaction and values submission from an element.",
      "readonly": "An attribute allowing users to highlight and copy input text, but preventing content modifications.",
      "type=\"submit\"": "An input or button parameter designating it to trigger parent form submission when clicked.",
      "src": "A structural path reference attribute specifying the target URL resource of images or scripts.",
      "href": "An anchor attribute specifying the target URL destination of hyperlink pathways.",
      "alt": "An attribute providing alternative descriptive text for images for screen readers and search engines.",
      "method=\"POST\"": "A form transmission attribute instructing the browser to package inputs inside HTTP request bodies.",
      "target=\"_blank\"": "A link navigation attribute instructing the browser to load the URL in a new tab."
    },
    "hard": {
      "HTML5 Canvas": "A pixel-level scripting interface allowing dynamic JavaScript drawing of custom shapes and graphics.",
      "SVG Scalable Vectors": "An XML-based vector graphics format that scales cleanly to any resolution without pixelation.",
      "iframe sandbox attribute": "A security parameter restricting scripts execution, form submissions, and popups inside frames.",
      "Web Workers integration": "A script setup spinning off heavy operations into separate background threads without freezing browser UI.",
      "Custom Elements (Web Components)": "A standard allowing developers to register and instantiate custom HTML tags with modular behaviors.",
      "Shadow DOM encapsulation": "A boundary API isolating styles and element subtrees from external global page styles.",
      "Content Security Policy (CSP) meta tag": "A security rule restricting resource loading sources and script execution pathways on pages.",
      "Server-Sent Events (SSE)": "A persistent server-to-client unidirectional connection pushing text updates over HTTP.",
      "Websocket connections": "A persistent bi-directional communication protocol allowing real-time client-server packets exchange.",
      "Local Storage vs Session Storage": "Persistent client storage (survives tab close) versus transient tab-bound client storage."
    }
  },
  "CSS": {
    "easy": {
      "color": "Sets the foreground text color of page elements.",
      "background-color": "Configures the background color of an element's box model area.",
      "font-size": "Controls the sizing scale of typography fonts.",
      "margin": "Defines outer spacing boundaries around elements, outside of borders.",
      "padding": "Defines inner spacing margins between elements content and their borders.",
      "border": "Sets borders thickness, line styles, and color boundaries around boxes.",
      "width": "Sets the horizontal layout dimension size of elements.",
      "height": "Sets the vertical layout dimension size of elements.",
      "text-align": "Configures horizontal alignment (left, right, center, justify) of inline text contents.",
      "display": "Sets the layout display type (block, inline, flex, grid, none) of boxes."
    },
    "medium": {
      "Flexbox layout": "A one-dimensional alignment engine optimized for spacing items along rows or columns.",
      "Grid layouts": "A two-dimensional layout engine structured around parent rows and columns grid gaps.",
      "position: absolute": "Removes an element from document flow, positioning it relative to its closest positioned parent.",
      "position: relative": "Positions elements relative to their normal document flow position, serving as absolute roots.",
      "position: fixed": "Removes elements from document flow, positioning them relative to static viewport screens.",
      "position: sticky": "Toggles elements between relative and fixed positioning based on scroll offset positions.",
      "box-sizing: border-box": "Forces padding and borders to be included inside the defined element width and height size.",
      "z-index values": "Sets the layout depth coordinate stacking order of positioned document layers.",
      "CSS transitions": "Allows visual property updates to animate smoothly over specified duration intervals.",
      "CSS transforms": "Applies coordinate transformations (scale, rotate, translate) to modify visual geometries."
    },
    "hard": {
      "CSS Custom Properties (Variables)": "Dynamic design tokens scoped to element trees for uniform variable value updates.",
      "backdrop-filter": "Applies visual filter effects (blur, saturation) to backgrounds visible underneath boxes.",
      "clip-path": "Defines a custom geometric clipping mask to restrict the visible boundary shape of elements.",
      "Media Queries container features": "Responsive styling based on parent container sizes instead of global viewport widths.",
      "Grid auto-fit vs auto-fill": "Auto-fit expands columns to fill available rows spaces; auto-fill maintains grid sizes.",
      "CSS custom keyframe animations": "Multi-stage keyframe schedules controlling complex visual transitions.",
      "will-change property": "Provides browser graphics engines rendering hints to isolate layers for GPU hardware speedups.",
      "CSS nesting rules": "Allows writing style rules nested inside parent selectors for readability and scoping.",
      "CSS layer boundaries": "Explicit cascades grouping layers to govern styles override specificity priority rankings.",
      "CSS containment properties": "Isolates style, layout, and paint computations of subtrees to optimize page rendering speed."
    }
  },
  "JavaScript": {
    "easy": {
      "Variables (let/const/var)": "Variable bindings (let block-scoped, const immutable binding, var functional-scoped).",
      "Arrays": "Ordered, index-accessible collections of values containing dynamic datatypes.",
      "Strings": "Text data represented as sequences of characters enclosed in quote parameters.",
      "Numbers": "Numeric values (both integer and floating-point representations) processed by operations.",
      "Boolean": "Logical values containing exactly true or false flag states.",
      "typeof operator": "Evaluates variable datatypes returning string descriptors of types.",
      "console.log()": "Prints string logs and values evaluations to browser and system terminals.",
      "Functions declarations": "Reusable named blocks of logic instantiated using function keywords.",
      "Arithmetic operators": "Mathematical symbols (+, -, *, /, %) executing math computations on values.",
      "Comparison operators": "Evaluation operators (==, ===, !=, !==, >, <) returning logical flags."
    },
    "medium": {
      "Promises": "Objects representing eventual completion or failure states of async operations.",
      "Async / Await": "Synchronous-looking wrappers around Promise-based async logic chains.",
      "Array.prototype.map()": "Transforms array collections returning a brand new array of equal size.",
      "Array.prototype.filter()": "Filters array elements returning a new list containing only truthy matches.",
      "Array.prototype.reduce()": "Reduces arrays down to a single accumulated value using evaluations.",
      "Closures": "Functions bundling references to surrounding lexical variables environments.",
      "Hoisting": "V8 compile phase moving variable and function declarations to tops of scopes.",
      "Prototype Chain": "Object lookup chains linking prototypes to inherit objects behaviors.",
      "Event Bubbling": "Browser event dispatching traveling upward from target elements to parents.",
      "Strict Mode (\"use strict\")": "Enforces cleaner runtime logic rules, throwing errors on bad patterns."
    },
    "hard": {
      "Event Loop (Microtasks vs Macrotasks)": "Prioritizes Promise microtasks queues execution before moving to setTimeout macrotasks.",
      "Prototype Inheritance model": "Dynamic runtime behaviors sharing where prototype references link parent objects.",
      "JavaScript Memory Leaks": "Detached DOM trees, global bindings, or uncleared timers holding references in heaps.",
      "Proxy and Reflect APIs": "Custom behavior interception wrappers managing target object traps.",
      "Generator functions (yield)": "Functions yielding iterators execution checkpoints using yield keywords.",
      "TypedArrays and ArrayBuffers": "Direct raw binary memory buffers storage read using specific dataview overlays.",
      "WeakMap vs WeakSet memory tracking": "Unreferenced key mappings allowing GC sweeps of objects references.",
      "Object.freeze() vs Object.seal()": "Freeze blocks all property changes; seal blocks structural changes but allows modifications.",
      "Event delegation efficiency": "Mounting single listeners on parent nodes rather than dozens on child nodes.",
      "Strict equality execution engine": "Triple equals checks type matching and values equivalence without castings."
    }
  },
  "Java": {
    "easy": {
      "int/double types": "Numeric variable declarations (int for 32-bit integers, double for 64-bit float values).",
      "String class": "Immutable sequences of characters objects managed by Java class definitions.",
      "System.out.println()": "Prints formatted logs to standard outputs terminals.",
      "class definition": "Standard templates defining structure, methods, and variables of objects.",
      "main() method": "The required entry point signature JVM executing logic start.",
      "new keyword": "Instantiates class templates allocating heap memory to objects.",
      "static keyword": "Binds properties or methods to classes directly rather than instances.",
      "if-else statements": "Standard logical branching evaluating conditions checks.",
      "for loop": "Standard iterative loops repeating blocks using indices.",
      "import statements": "Imports other packages libraries classes into namespace files."
    },
    "medium": {
      "Class Inheritance": "Extending class specifications sharing parent fields using extends keyword.",
      "Polymorphism": "Objects responding differently to same calls based on dynamic types.",
      "Encapsulation (getters/setters)": "Hiding fields using private scopes, exposed via public accessors.",
      "Interface implementation": "Declaring standard structural API contracts classes must implement.",
      "Abstract classes": "Partial class declarations that cannot be instantiated directly.",
      "ArrayList collection": "Dynamic array collections resizing array allocations automatically.",
      "HashMap collection": "Key-value pair hashing maps storage using hash key distributions.",
      "Exception try-catch block": "Capturing and routing runtime failures cleanly.",
      "Method Overloading vs Overriding": "Overloading uses same names with different params; overriding replaces parent methods.",
      "Garbage Collector basics": "JVM sweep algorithms clearing unreferenced objects in heaps."
    },
    "hard": {
      "Java Memory Model (Stack vs Heap)": "Stack stores thread locals and call traces; Heap stores shared objects allocations.",
      "JVM Metaspace": "Metaspace dynamic area storing class metadatas outside heap bounds.",
      "Reflection API": "Inspects and calls class constructors, fields, and private methods dynamically at runtime.",
      "Generics Type Erasure": "JVM compilation stripping generic type checks for backwards compatibility.",
      "ThreadPoolExecutor concurrency": "Manages execution queues and dynamic pools of reusable worker threads.",
      "volatile keyword": "Enforces thread-level cache flushes to memory for shared boolean flags.",
      "synchronized keyword block": "Enforces mutual exclusion thread monitors locks around target variables blocks.",
      "Garbage Collection Algorithms (G1/ZGC)": "Pause-optimized garbage sweeps dividing heaps into spatial regions.",
      "Serializable interface mechanics": "Serializes java objects metadata state into binary file streams.",
      "Classloader delegation model": "JVM Classloading routing parent lookups first to prevent packages overrides."
    }
  },
  "Python": {
    "easy": {
      "print()": "Prints string logs and evaluations to standard outputs.",
      "len()": "Returns the number of elements inside sequences or collections.",
      "list data structure": "Ordered, mutable sequential lists of dynamic variable inputs.",
      "dict data structure": "Key-value map associations indexing keys using hash mappings.",
      "set collection": "Unordered lists containing unique items, filtering duplicates.",
      "tuple type": "Ordered, immutable sequence lists of element records.",
      "def keyword": "Initiates function declarations naming logic blocks.",
      "class definition": "Declares object structures, containing methods and attributes definitions.",
      "import keyword": "Loads standard or external package modules namespaces.",
      "range() function": "Generates sequence iterables counting ranges of integers."
    },
    "medium": {
      "List comprehensions": "Concise loop syntax generating new lists dynamically from sequences.",
      "Dictionary comprehensions": "Concise syntax creating dictionaries inline evaluating iterators.",
      "Decorators (@)": "Functions wrapping other functions to intercept and modify behaviors.",
      "Generators and yield": "Lazy item yield processes returning iterators without memory buffers storage.",
      "Virtual Environments (venv)": "Isolated local directory environments keeping dependencies setups separate.",
      "pip package installer": "Installs and downloads software packages dependencies from PyPI indexes.",
      "f-strings formatting": "Literal string interpolation wrapping dynamic code inside curly braces.",
      "Dunder methods (__init__)": "Class initialization constructors instantiated when objects allocate.",
      "Dunder methods (__str__)": "Defines custom string descriptions printed for object representations.",
      "Lambda functions": "Anonymous single-line functions evaluated inline."
    },
    "hard": {
      "Global Interpreter Lock (GIL)": "CPython lock preventing multiple threads from executing bytecode concurrently.",
      "Metaclasses": "Class builders (classes of classes) intercepting class objects creation parameters.",
      "Descriptors protocol": "Governs attribute access routines using __get__ and __set__ methods.",
      "asyncio event loop": "Single-threaded async loop managing task routines scheduling.",
      "Python Garbage Collection (ref counts)": "Tracks variables references counts, cleaning zero-referenced objects.",
      "Memoryviews and Buffers": "Accesses raw array binary buffers data slice links without copies.",
      "deep vs shallow copies": "Shallow copies containers links; deep copies nested objects data structures.",
      "generator yield from mechanics": "Delegates operations directly to sub-generator sub-iterables cleanly.",
      "Python bytecode compilation (.pyc)": "CPython caching bytecode files speedups importing operations.",
      "sys.path module import search": "Directories list paths CPython searches when scanning import packages."
    }
  },
  "C": {
    "easy": {
      "#include directives": "Preprocessor commands pulling library header interfaces into code.",
      "int/char/float types": "Datatypes (int for numbers, char for single bytes, float for math decimals).",
      "printf()": "Prints formatted logs to standard outputs terminals.",
      "scanf()": "Reads input lines from consoles standard inputs.",
      "main() function": "Required compile program entry point logic block.",
      "for/while loops": "Iterative counters loops repeating sections of statements.",
      "if/else branching": "Branches execution flow based on logical checks evaluations.",
      "array declarations": "Fixed-size, contiguous stack array allocations of variable elements.",
      "return statements": "Exits program routines returning exit code numbers.",
      "comments (//)": "Code annotations stripped by preprocessor compilers."
    },
    "medium": {
      "Pointers": "Variable types storing absolute memory address locations as values.",
      "Memory addresses (&)": "Address-of operators returning memory coordinates pointers.",
      "struct definitions": "Packages heterogeneous variables grouped together under single types.",
      "union definitions": "Packages heterogeneous variables sharing the same memory location offset.",
      "fopen / fclose functions": "Standard system file I/O descriptor managers.",
      "string.h helpers (strcpy)": "Copies characters arrays memory blocks between buffers pointers.",
      "string.h helpers (strlen)": "Loops character arrays until null terminator byte counts size.",
      "typedef declarations": "Aliases existing datatypes with custom namespace descriptors.",
      "switch-case blocks": "Conditional routes branching directly to matching value labels.",
      "Enum parameters": "Named integer constant sets aliases mapping variables options."
    },
    "hard": {
      "malloc / free dynamic memory": "Manually allocates byte regions in heap pools; must be freed.",
      "Pointer Arithmetic": "Offsets memory address pointers directly based on type byte sizing.",
      "Function Pointers": "Pointers holding entry address references of program routines.",
      "Buffer Overflows risks": "Writing past allocated array lengths, risking stack corruptions.",
      "Preprocessor macros (#define)": "Evaluates compiler macro substitutions strings patterns before compiles.",
      "extern storage class": "Declares global variables linked across different C source files.",
      "static storage class in C": "Binds variables scope internally to files or local scopes persistent.",
      "memory leaks detection": "Tracks allocations missing matching calls to free heap memory.",
      "const pointer vs pointer to const": "Const pointer locks address; pointer to const locks data.",
      "void pointers castings": "Raw typeless pointers cast dynamically to any target type."
    }
  },
  "C++": {
    "easy": {
      "std::cout": "Standard console stream writing formatted output strings.",
      "std::cin": "Standard console stream reading inputs characters.",
      "std::string": "Dynamic strings class wrapper managing char arrays sizes.",
      "namespace std": "Scoped prefix isolating standard C++ template structures.",
      "classes and objects": "OOP structure blueprints instantiating data variables and methods.",
      "references (&)": "Safe variable aliases referencing target objects directly without pointers.",
      "public/private access": "Encapsulation access controls scoping compiler checks visibility.",
      "simple inheritance": "Inherits base parent classes elements using colon selectors.",
      "std::vector": "Standard template dynamic list resizing bounds automatically.",
      "main() function": "C++ standard program runtime entry point routine."
    },
    "medium": {
      "Standard Template Library (STL)": "Standard template library packing common lists, maps, and algorithms.",
      "operator overloading": "Defines custom behaviors for standard operator symbols on objects.",
      "constructors / destructors": "Constructor initializes classes; destructor sweeps resources on scope exit.",
      "virtual functions": "Allows base pointers to call derived class methods dynamically.",
      "template classes": "Generates generic class templates compiled based on type inputs.",
      "C++ exception throw-catch": "Standard runtime exception throw and catch scope routing.",
      "smart pointers (unique_ptr)": "Exclusive ownership pointer cleaning allocated object on scope exit.",
      "smart pointers (shared_ptr)": "Reference-counted pointer, freeing object when counts reach zero.",
      "polymorphism inheritance": "OOP design dynamic calling using base classes pointers interfaces.",
      "std::map container": "Red-Black balanced tree map mapping keys ordered properties."
    },
    "hard": {
      "Resource Acquisition Is Initialization (RAII)": "Ties resource lifetime to stack objects lifecycles to prevent leaks.",
      "Rule of Three / Five / Zero": "Governs custom implementations of copy, move, and destructors patterns.",
      "move semantics and rvalue refs": "Transfers heap allocations ownership instead of executing deep copies.",
      "virtual inheritance diamond problem": "Enforces single shared base parent objects in multiple inheritance trees.",
      "vtables and virtual dispatch": "Runtime function dispatch tables mapping virtual methods calls.",
      "template metaprogramming": "Forces C++ compiler to execute complex logic calculations at compile-time.",
      "std::move vs std::forward": "std::move casts to rvalue; std::forward preserves reference categories.",
      "consteval vs constexpr": "constexpr runs compile or runtime; consteval forces compile-time execution.",
      "explicit constructor keyword": "Disallows compiler from executing silent implicit type conversions.",
      "placement new operators": "Allocates objects directly on pre-allocated raw memory locations."
    }
  },
  "DBMS": {
    "easy": {
      "Database schema": "The overall logical structure blueprint of tables and columns relationships.",
      "Tables": "Relational table grid containers containing rows and columns.",
      "Columns and rows": "Columns specify attribute data; rows store record datasets.",
      "Primary Key": "A unique column constraint identifying table records distinctly.",
      "Foreign Key": "A column reference link linking records to primary keys.",
      "Relational database": "Tabular relational databases structured on schema connections.",
      "Data integrity": "Assurance of database accuracy, validation, and consistency.",
      "Constraints": "Validation rules (NOT NULL, UNIQUE, CHECK) restricting column inputs.",
      "Attributes": "Individual columns fields defining table properties.",
      "Redundancy": "Unnecessary data repetition causing storage and updates inconsistencies."
    },
    "medium": {
      "1st Normal Form (1NF)": "Enforces atomic cell values, eliminating nested repeating fields groups.",
      "2nd Normal Form (2NF)": "Requires 1NF, removing partial dependencies on composite keys.",
      "3rd Normal Form (3NF)": "Requires 2NF, removing transitive dependencies on non-prime keys.",
      "Entity-Relationship (ER) model": "Conceptual visual diagram mapping database entities and connections.",
      "ACID principles": "Guarantees transaction reliability (Atomicity, Consistency, Isolation, Durability).",
      "Locks and Transactions": "Locking mechanisms preventing concurrent transactions from corrupting datasets.",
      "Two-Phase Locking (2PL)": "Enforces serializability by acquiring locks first, then releasing them.",
      "Database Indexing": "Balanced tree lookups mapping files to accelerate query speeds.",
      "Concurrency control": "Abstractions managing concurrent access blocks on shared data records.",
      "Referential Integrity": "Enforces relational links references checking foreign keys validation."
    },
    "hard": {
      "BCNF normalization rules": "Normal form requiring every determinant key to be a candidate key.",
      "Conflict Serializability": "Confirms concurrency schedules resolve equivalent to serial scheduling.",
      "View Serializability": "Advanced serial schedule equivalence checking base reads/writes sequences.",
      "Cascadeless Schedules": "Enforces transactions to commit before others read their modifications.",
      "Relational Algebra operations": "Mathematical query execution operations (Select, Project, Join, Union).",
      "B+ Tree Index splits": "Indexing structures split nodes when leaf pages exceed capacities.",
      "Deadlock Bankers Algorithm in DBMS": "Resource tracker checking resource allocations requests to prevent locks.",
      "Multi-version Concurrency Control (MVCC)": "Maintains data versions so reads don't block concurrent writes.",
      "Query cost optimization": "Evaluates index scans cost to find cheapest query plans.",
      "Log-based recovery systems": "Write-Ahead Logs (WAL) recording operations to rollback updates on failure."
    }
  },
  "SQL": {
    "easy": {
      "SELECT": "Retrieves columns and records datasets from database tables.",
      "WHERE": "Filters row constraints matching specific logical condition checks.",
      "INSERT INTO": "Appends brand new records rows to target tables.",
      "UPDATE": "Modifies existing values inside selected table rows.",
      "DELETE": "Removes selected records rows from database tables.",
      "ORDER BY": "Sorts query output rows ascending or descending.",
      "GROUP BY": "Aggregates output rows sharing identical column values.",
      "JOIN": "Queries records by matching related columns across tables.",
      "CREATE TABLE": "Declares new table structures with defined columns datatypes.",
      "DROP TABLE": "Deletes table schemas and all their rows permanently."
    },
    "medium": {
      "INNER JOIN vs LEFT JOIN": "Inner joins match both tables rows; Left joins keep all left table records.",
      "SQL subqueries": "Nested query structures evaluated to supply filters to outer queries.",
      "Database Indexes": "B-Tree structures mapping columns to accelerate query times.",
      "Prepared Statements": "Parameterized query templates separating code from input to block injections.",
      "HAVING clause": "Filters aggregated records groups generated by GROUP BY commands.",
      "AS alias": "Renames columns or tables outputs with custom temporary labels.",
      "Transaction SAVEPOINT": "Enables rollbacks to named checkpoints inside active transactions.",
      "SQL Views": "Virtual query table shortcuts saved to simplify execution templates.",
      "DISTINCT values": "Filters out duplicate records, returning unique values list.",
      "Primary key vs Unique key": "Primary key identify records uniquely; Unique key does same but allows nulls."
    },
    "hard": {
      "Window Functions (ROW_NUMBER / DENSE_RANK)": "Executes analytical partition ranks calculations across sorted windows.",
      "Common Table Expressions (CTEs)": "Temporary named query blocks instantiated before main queries execute.",
      "Database Triggers": "Automated scripts running on INSERT, UPDATE, or DELETE actions.",
      "Stored Procedures": "Complex SQL blocks stored on servers to compile database routines.",
      "Isolation levels (Serializable)": "Strongest isolation level, disallowing concurrent dirty or phantom reads.",
      "Query Execution Plans": "Visual breakdown charts details indexing scans query optimizer costs.",
      "Correlated Subqueries": "Nested queries referencing variables from parent queries, running per row.",
      "Database Cursor operations": "Sequential row parsing pointers iterating datasets row-by-row manually.",
      "SQL collation sequences": "String character set mapping sequences defining sorting behaviors.",
      "Full-Text Search indices": "Advanced text index search scans tracking words within columns contents."
    }
  },
  "MongoDB": {
    "easy": {
      "Collections": "BSON document group containers, equivalent to SQL tables.",
      "Documents": "Individual JSON-like records containing key-value data fields.",
      "insertOne()": "Appends a single document record to target collections.",
      "find()": "Queries collection records matching filter parameters.",
      "updateOne()": "Updates selected fields on a single matching document.",
      "deleteOne()": "Removes a single matching document record from collections.",
      "BSON format": "Binary JSON database storage format supporting advanced types.",
      "ObjectId": "Default 12-byte unique ID format generated for documents.",
      "_id field": "Default primary key index field required on MongoDB documents.",
      "NoSQL definition": "Non-relational document data model supporting dynamic schemas."
    },
    "medium": {
      "Aggregation pipelines": "Multi-stage data transformation processing arrays pipelines.",
      "$match operator": "Aggregation filtering stage returning matching documents rows.",
      "$group operator": "Aggregation stage grouping documents to compute calculations.",
      "$project operator": "Aggregation stage reshaping documents by selecting specific fields.",
      "$lookup operator (joins)": "Aggregation stage performing left outer joins across collections.",
      "MongoDB Indexes": "Single or compound indexes speeding up document queries scans.",
      "Embedded Subdocuments": "Nesting JSON records inside parent documents schemas.",
      "Document schema validation": "Schema validation rules checking document layouts on writes.",
      "cursor.limit()": "Restricts query cursor size returning max selected items count.",
      "upsert parameter": "Parameter update updates rows or creates them if missing."
    },
    "hard": {
      "MongoDB Sharding": "Horizontally partitions collections database rows across clusters shard keys.",
      "MongoDB Replica Sets (elections)": "Automatic backup node clusters executing elections on primary failure.",
      "WiredTiger Storage Engine": "Document concurrency control manager optimizing RAM memory allocations.",
      "MongoDB transactions (ACID)": "Multi-document ACID isolation transactions committing concurrently.",
      "Index optimization (covered queries)": "Queries resolved entirely within indices, skipping documents reads.",
      "Write Concern parameters": "Specifies write acknowledgment wait states on secondary replica nodes.",
      "Read Preference parameters": "Directs read queries to primary or secondary database nodes.",
      "Aggregation explain() method": "Returns execution plans logs outlining aggregate pipeline indexing stages.",
      "GridFS files storage": "Splits files exceeding 16MB document limits into chunks collections.",
      "Change Streams triggers": "Real-time client triggers notifying data changes logs events."
    }
  },
  "NodeJS": {
    "easy": {
      "Node.js runtime": "Chrome V8 engine wrapper executing javascript on servers.",
      "require() / module.exports": "CommonJS file import/export system used in Node applications.",
      "npm package manager": "The official registry library manager for Node package dependencies.",
      "console.error()": "Prints failure log details to stderr error streams.",
      "path module basics": "Core module utility resolving absolute files directory paths.",
      "fs module basics": "Core module API executing filesystem files reads and writes.",
      "global variable object": "Root namespace object variables accessible across node files.",
      "process.env variables": "System environment variables configurations loaded at runtime.",
      "package.json dependencies": "JSON metadata file outlining dynamic project package limits.",
      "running node files": "Invoking node binary scripts from system command shell environments."
    },
    "medium": {
      "Node Event Emitter class": "Event routing pattern class allowing registering custom events emitters.",
      "Streams and Buffers": "Binary data buffers reading files chunks sequentially.",
      "fs.readFile vs fs.readFileSync": "Asynchronous callback non-blocking reads versus blocking script execution reads.",
      "Express routing middleware": "Routing handlers chains intercepting server requests payloads.",
      "package.json script tags": "Terminal aliases scripts defined inside project packages files.",
      "process.nextTick()": "Queues microtasks callbacks to execute right after active loops finish.",
      "http.createServer method": "Core http module API initializing network servers listening ports.",
      "Node.js Error first callbacks": "Standard callback signature routing errors as first parameters.",
      "cors configuration middleware": "Middleware managing browser CORS access headers validations.",
      "body-parser utility": "Express parsing middleware converting request payload streams to JSON."
    },
    "hard": {
      "Libuv thread pool": "Handles heavy asynchronous filesystem I/O operations outside main loops.",
      "Node.js Event Loop phases": "Iterates timer checks, poll updates, and callbacks phases sequentially.",
      "cluster module clustering": "Forks master processes into multiple CPU worker processes scaling.",
      "child_process fork mechanics": "Spins off separate Node instances running independent IPC channels.",
      "Buffer memory allocations (Buffer.allocUnsafe)": "Allocates uninitialized memory regions rapidly without zero-filling.",
      "stream backpressure handle": "Pauses stream read limits when target write buffers fill up.",
      "Node.js V8 memory heap limits": "Manages max RAM garbage collector limits (typically 1.4GB on 64-bit).",
      "Worker Threads module concurrency": "Enables CPU-bound multithreaded task loops sharing heap variables.",
      "ES Modules vs CommonJS runtime differences": "ES Modules load statically asynchronously; CommonJS resolves modules dynamically synchronously.",
      "crypto module hash functions": "Core library managing secure algorithms encryption keys hashes."
    }
  },
  "React": {
    "easy": {
      "JSX markup syntax": "JavaScript XML extension styling layout syntax templates.",
      "React Components": "Modular reusable template blocks generating visual HTML structures.",
      "Component Props": "Input parameters variables passed from parent elements to child components.",
      "useState Hook": "Tracks local component reactive state values updates.",
      "React Event handlers": "Encapsulated browser event listeners (onClick, onChange) triggers.",
      "Functional Components": "JavaScript functions returning UI template grids configurations.",
      "React rendering basics": "Evaluating component trees returning changes to update browser page views.",
      "React CSS className": "Assigns CSS styling classes labels to JSX elements tags.",
      "React inline styles": "Injects CSS attributes styling objects directly into elements.",
      "ReactDOM.render()": "Mounts virtual React structures to physical DOM nodes."
    },
    "medium": {
      "useEffect hook dependencies": "Controls execution of side effects based on changes in dependency lists.",
      "useContext hook state": "Retrieves shared parent context values without props drilling.",
      "useRef hook boundaries": "Maintains persistent mutable object references that don't trigger rerenders.",
      "useMemo and useCallback hooks": "Caches computed values or callback function definitions between renders.",
      "Component Lifecycle methods": "Hooks tracing component mount, update, and unmount sequences.",
      "State Lifting strategy": "Moving state variables upward to closest common ancestor components.",
      "Controlled vs Uncontrolled inputs": "Controlled uses state for value updates; Uncontrolled uses DOM refs.",
      "Custom React hooks creators": "Reusable stateful logic functions extracted into custom hooks.",
      "React Router routing": "Virtual client-side routing matching paths to specific views components.",
      "React fragments (<> / </>)": "Groups lists of child elements without adding container DOM wrapper nodes."
    },
    "hard": {
      "Virtual DOM reconciliation (Fiber)": "Fiber updates virtual DOM components dynamically using incremental render slices.",
      "Concurrent Rendering mode": "Enforces non-blocking rendering, prioritizing user inputs during UI rendering.",
      "Server-Side Rendering (SSR) vs static build": "SSR generates HTML dynamically per request; Static pre-builds all views.",
      "Context API vs Redux updates optimization": "Redux tracks selectors to restrict rerenders; Context triggers all sub-consumers.",
      "forwardRef forward boundaries": "Passes DOM element references downward across component wrappers limits.",
      "Error Boundaries components": "Class components catching layout crashes to display fallback interfaces.",
      "React.memo element wrappers": "Memoization wrapper disallowing component rerenders if props remain unchanged.",
      "Suspense lazy loading boundaries": "Delays component rendering displaying loaders while async imports load.",
      "React reconciliation keys matching": "Unique list identifier keys allowing Fiber to track DOM nodes correctly.",
      "State batching batch updates": "Groups multiple state updates inside event loop ticks to minimize rerenders."
    }
  },
  "DSA": {
    "easy": {
      "Arrays": "Sequential contiguous memory lists storing fixed collections of elements.",
      "Single Linked Lists": "Linear structures of nodes, where each node points to the next.",
      "Stacks (LIFO)": "Last-In-First-Out data structures handling push and pop operations.",
      "Queues (FIFO)": "First-In-First-Out structures queueing items for enqueue and dequeue processes.",
      "Linear Search": "Scanning items one-by-one from list start until targets match.",
      "Bubble Sort algorithm": "Iteratively swapping adjacent unsorted items until arrays are sorted.",
      "String reversals": "Reversing string array characters indices from ends to starts.",
      "Basic loops iterations": "Using counter loops to repeat statements blocks over sequences.",
      "Array push / pop complexity": "O(1) constant time complexity when modifying array tail items.",
      "Time complexity O(1)": "Constant runtime execution independent of input data sizes."
    },
    "medium": {
      "Double Linked Lists": "Linked list nodes containing references to both next and previous nodes.",
      "Binary Search Tree (BST)": "Nodes tree where left child value is smaller and right child is larger.",
      "Hash Table collisions": "Resolving duplicate key hash mappings using chaining or probing.",
      "Quick Sort vs Merge Sort": "Quick sort sorts inline using partition pivots; Merge sort splits arrays.",
      "Recursion basics": "Functions invoking themselves until hitting explicit base case checks.",
      "Binary Tree traversals (In-order)": "Traversing tree structures (Left child, Root node, Right child) recursively.",
      "Stack implementation using lists": "Building stacks dynamically using linked lists nodes lists.",
      "Queue implementation using arrays": "Structuring circular queues arrays managing front and rear indices.",
      "Binary Search algorithm": "Logarithmic search splitting sorted list ranges in halves repeatedly.",
      "Time complexity O(N log N)": "Optimal time scale of divide-and-conquer sorting algorithms."
    },
    "hard": {
      "AVL Trees balance factors": "Self-balancing tree rotating nodes when height differences exceed one.",
      "Red-Black Trees balance rules": "Enforces balance by coloring nodes and restricting consecutive red nodes.",
      "Dijkstra Shortest Path algorithm": "Finds single-source shortest path routes using priority queues relaxation.",
      "Dynamic Programming (memoization)": "Solves complex overlapping sub-problems by caching intermediate results.",
      "Trie data structures": "Prefix trees mapping strings keys characters nodes paths.",
      "Amortized Time Complexity analysis": "Computes average execution cost of operations sequences over time.",
      "Binary Heap structural properties": "Complete binary trees mapping min/max parent key property layouts.",
      "Graph DFS vs BFS algorithms": "DFS explores deep pathways via stacks; BFS scans radial breadths via queues.",
      "Floyd-Warshall all pairs pathing": "Dynamic programming algorithm calculating shortest paths between all pairs.",
      "Kruskal Minimum Spanning Tree": "Generates minimal weights spanning trees sorting edges and checking cycles."
    }
  },
  "OS": {
    "easy": {
      "Operating System kernel": "Core OS engine coordinating memory allocation and CPU scheduling.",
      "User space vs Kernel space": "User space runs restricted applications; Kernel space has direct hardware access.",
      "Filesystem structures": "Logical organization of records storage on physical hardware disks.",
      "Directories paths": "Structured directory paths mapping files absolute locations.",
      "GUI vs CLI": "Graphic user screens versus command line text terminals.",
      "CPU processing cycles": "Hardware processing clock rates executing compiled assembly commands.",
      "RAM memory allocations": "Temporary data segments storage areas in physical memory units.",
      "Device Drivers roles": "Software layers converting OS calls into physical hardware actions.",
      "System calls traps": "Software interrupts shifting CPU execution from user to kernel mode.",
      "Multitasking basics": "OS rapidly context switching processes to run program tasks concurrently."
    },
    "medium": {
      "Process vs Thread": "Process allocates independent memory spaces; Threads share process registers.",
      "Round Robin scheduling": "CPU scheduling routing tasks using fixed time-slice quantum clocks.",
      "Virtual Memory paging": "Mapping virtual memory blocks onto physical RAM page slots.",
      "Page replacement (LRU)": "Evicting Least Recently Used page slots when RAM bounds fill.",
      "Process Synchronization (Mutex)": "Mutual exclusion locking handles preventing race conditions on shared memory.",
      "Semaphores counters": "Logical signal counters controlling resource access boundaries.",
      "Deadlocks conditions": "Circular wait states where processes lock resources, blocking progress.",
      "Context switching steps": "Saving active CPU states to load another process state instructions.",
      "Banker Algorithm parameters": "DBMS/OS check routine evaluating safe allocations states to prevent deadlocks.",
      "File Allocation Table (FAT)": "Legacy directory allocation index table mapping files clusters locations."
    },
    "hard": {
      "Multi-level Page Tables structure": "Hierarchical address maps reducing virtual memory page table overhead.",
      "Translation Lookaside Buffer (TLB)": "Hardware cache accelerating page virtual-to-physical address conversions.",
      "Banker deadlock avoidance checks": "Logical checks determining if resource requests lead to deadlocks.",
      "Symmetric Multiprocessing (SMP) scheduling": "Schedules process tasks across multiple CPU cores balanced workloads.",
      "Trap interrupts execution sequence": "CPU redirects control to kernel trap tables to handle failures.",
      "RAID controller configurations": "Organizing multiple disks arrays to optimize speed and redundancy.",
      "Inverted Page Tables indexes": "Address translation structures mapping physical page slots directly to processes.",
      "Thread scheduling kernel models": "OS mapping thread calls (1:1, M:N) to kernel contexts.",
      "Memory Thrashing causes": "System spending more time swapping pages than executing instructions.",
      "Monolithic vs Microkernel architecture": "Monolithic packs all services in kernel; Microkernel delegates to user processes."
    }
  },
  "CN": {
    "easy": {
      "IP Addresses": "Unique numerical addresses identifying nodes inside internet network systems.",
      "Network routers": "Hardware packet routers routing data packets across network paths.",
      "Network switches": "Internal network switches routing ethernet packets inside local area networks.",
      "Client-Server architecture": "Request-response design matching browser clients to server hosts.",
      "Internet protocols": "Standard rules packages (TCP, IP, UDP) defining data transfers.",
      "Web browser client": "Desktop application parsing visual HTML templates and fetching resources.",
      "Local Area Network (LAN)": "Private network spanning small spatial boundaries (e.g. rooms).",
      "Domain Names": "Human-readable names mapped to database IP addresses via DNS.",
      "Wi-Fi connections": "Wireless protocol using radio frequencies to establish connections.",
      "Ethernet cables": "Physical copper wiring links transmitting high-speed electrical signals."
    },
    "medium": {
      "OSI 7 Layers model": "Conceptual network boundary architecture (Physical up to Application).",
      "TCP/IP 4 Layers model": "Industry-standard layered network stack (Link, Internet, Transport, Application).",
      "HTTP / HTTPS protocol": "Hypertext Transfer Protocol (HTTPS wraps secure SSL/TLS encryptions).",
      "Domain Name System (DNS)": "Distributed domain mapping database resolving names to IP addresses.",
      "TCP vs UDP transmission": "TCP ensures packet arrival check validations; UDP streams packets rapidly.",
      "Address Resolution Protocol (ARP)": "Resolves logical IP network addresses to physical hardware MAC addresses.",
      "Internet Control Message Protocol (ICMP)": "Diagnostics signaling protocols returning network failure messages.",
      "Subnetting IP addresses": "Splitting network blocks into smaller subnet directories pools.",
      "DHCP server allocation": "Automated server service distributing dynamic IP addresses to clients.",
      "Three-way Handshake sequence": "Establishing TCP sockets connections using SYN, SYN-ACK, ACK sequence."
    },
    "hard": {
      "TCP Congestion Control (Slow Start)": "Algorithm adjusting window size to prevent link saturations.",
      "Border Gateway Protocol (BGP)": "Path-vector routing protocol directing packets between autonomous systems.",
      "SSL / TLS handshake sequence": "Cryptographic routine exchanging keys to build encrypted HTTPS connections.",
      "DNS recursive vs iterative resolution": "Recursive lookups delegate resolutions; Iterative checks server lists manually.",
      "IPv6 address representation": "128-bit hexadecimal addressing format replacing limited 32-bit IPv4 pools.",
      "IPsec security configuration": "Security framework encrypting IP packets payloads at IP network layers.",
      "OSPF link-state routing": "Interior gateway routing algorithm resolving paths using Dijkstra OSPF checks.",
      "TCP window scale factor": "Enables scaling congestion window sizes past legacy 64KB limits.",
      "DHCP starvation mitigation": "Switch security disallowing malicious MAC spoofing from stealing IP leases.",
      "HTTP/2 multiplexing pipelines": "Allows concurrent assets loading over single persistent TCP connections."
    }
  },
  "SE": {
    "easy": {
      "Software Development Life Cycle": "Methodology tracing software stages from requirements analysis down to deployment.",
      "Debugging code": "Identifying, tracing, and resolving programming syntax and logic failures.",
      "Code compilation": "Translating human-readable code files into machine-level binaries.",
      "Team Git workflows": "Collaborative version control branches schedules managing codebase updates.",
      "Software requirements": "Specifies detailed product features agreements and logic boundaries.",
      "Software testing basics": "Running automated or manual checks to verify features function correctly.",
      "Program documentation": "Code comments, README files, and documentation tracking system setups.",
      "Software bugs": "Logic or compiler errors causing programs to return incorrect outputs.",
      "Agile principles": "Iterative software development values focusing on collaboration and speed.",
      "Waterfall model": "Legacy sequential development models moving strictly through phases stages."
    },
    "medium": {
      "Agile Scrum methodology": "Organizes software workflows around visual sprint cycles and reviews.",
      "Singleton design pattern": "Restricts class instantiation to a single persistent instance globally.",
      "Factory design pattern": "Delegates instantiation logic to creator classes, separating concerns.",
      "Observer design pattern": "Subscription patterns notifying client objects when target values update.",
      "Model-View-Controller (MVC)": "Separates data objects, visual UI layouts, and routing logic.",
      "Unit vs Integration testing": "Unit tests isolate individual methods; Integration tests check multi-module setups.",
      "Git branch pull requests": "Code review reviews before merging branch updates into main codebases.",
      "UML class diagrams": "Visual class blueprints diagrams mapping relationships and inheritances.",
      "REST API standards": "HTTP API design standard using standard verbs (GET, POST, PUT, DELETE).",
      "Software refactoring metric": "Rewriting legacy structures to reduce complexity without changing behaviors."
    },
    "hard": {
      "SOLID design principles": "Class design rules optimizing extensibility, readability, and decoupling.",
      "Clean Architecture layering": "Strict architectural boundaries separating core business logic from databases.",
      "System design trade-offs (CAP theorem)": "Trade-offs balancing Consistency, Availability, and Partition tolerance in clusters.",
      "Microservices communication patterns": "Decoupling server architectures using REST APIs or message brokers.",
      "Continuous Integration / Deployment (CI/CD)": "Automated pipeline systems testing and deploying codebase updates.",
      "Code coupling and cohesion metrics": "Coupling measures module dependencies; Cohesion tracks internal code focus.",
      "Domain-Driven Design (DDD) aggregates": "Groups of related database models treated as single transactional units.",
      "Test-Driven Development (TDD) cycle": "Red-Green-Refactor development cycles writing unit tests before logic.",
      "Security Threat Modeling (STRIDE)": "Security check protocol classifying threats (Spoofing, Tampering, Info Disclosure).",
      "Software complexity metrics (Cyclomatic)": "Measures program logical complexity counting decision paths in functions."
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONCEPT_DESCRIPTIONS;
}
