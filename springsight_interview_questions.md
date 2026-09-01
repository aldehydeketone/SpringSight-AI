# SPRINGSIGHT AI - INTERVIEW CROSS-QUESTIONS

Here is a list of practical, highly likely cross-questions an interviewer might ask you based on your project summary, along with the ideal, easy-to-understand answers you should give.

---

## 0. Basic Java & Spring Boot Fundamentals (For Freshers)

**Q1: How did you use Object-Oriented Programming (OOP) in this project?**
* **Answer:** "I used OOP everywhere. For example, I used *Encapsulation* by making all my variables private in my database classes (like `User` or `LogFile`) and using Getters/Setters to access them. I also used *Abstraction* by creating Service interfaces, so my Controller only knows *what* the service does, not *how* the service actually does it."

**Q2: What is Dependency Injection and how did you use it?**
* **Answer:** "Dependency Injection means I don't have to write `new Service()` every time I need an object. Instead, I let Spring Boot create and manage the objects for me. I used constructor injection (and `@Autowired`) so Spring automatically hands my Controller the exact Service it needs to run. It makes the code much cleaner and easier to test."

**Q3: What is a DTO and why did you use it instead of just sending your Database Entities to the frontend?**
* **Answer:** "A DTO (Data Transfer Object) is a simple Java class used only to carry data over the network. I used DTOs because I don't want to send my entire Database Entity to the frontend. For example, my `User` entity has a password hash in it. By using a `UserResponseDTO`, I can pick and choose to only send the username and email, keeping the password completely hidden."

**Q4: What is the difference between `@Controller` and `@RestController`?**
* **Answer:** "`@Controller` is usually used when the server is sending back full HTML pages. But since I built a React frontend, my backend only needs to send back raw data (JSON). That's why I used `@RestController`—it tells Spring to automatically convert all my Java objects straight into JSON format before sending them to React."

**Q5: How do you hide your database passwords and API keys? You didn't hardcode them in your Java files, right?**
* **Answer:** "Exactly, I never hardcode secrets. I put my MySQL passwords and my Gemini API keys inside the `application.properties` file. In a real production server, I would read these from secure Environment Variables so the passwords are never actually saved in the code repository at all."

---

## 1. Questions on Architecture & Spring Boot

**Q6: You chose a Monolith instead of Microservices. When would you decide it’s time to switch to Microservices?**
* **Answer:** "Right now, the monolith is perfect because the app is simple and everything fits nicely in one database. I would only switch to microservices if we had a massive amount of users uploading logs 24/7, causing the Log Parsing feature to consume all the server's CPU. If that happened, I would separate the 'Log Parser' into its own microservice so it could scale independently without slowing down the Login or PDF generation features."

**Q7: Why did you choose Spring Boot instead of plain Spring or Express.js?**
* **Answer:** "I chose Spring Boot because it does a lot of the heavy lifting automatically. It comes with an embedded Tomcat server, so I don't have to configure one manually. It also provides 'starter dependencies' which automatically set up things like JPA and Security without needing huge XML configuration files. It let me focus purely on the business logic."

**Q8: How did you connect your React frontend to your Spring Boot backend? Did you face any issues?**
* **Answer:** "React runs on port 5173 (Vite) and Spring Boot runs on port 8080. When React tried to call the backend, the browser blocked it because of a security rule called CORS (Cross-Origin Resource Sharing). I fixed this by adding a `@CrossOrigin` setup in my Spring Boot configuration to explicitly allow requests coming from the React port."

---

## 2. Questions on the Duplicate Parsing Bug & Database

**Q9: You mentioned using `@Transactional` to fix the duplicate data bug. What exactly does `@Transactional` do under the hood?**
* **Answer:** "Under the hood, `@Transactional` opens a single database connection. It tells MySQL: 'Don't save any of these changes permanently until the whole method finishes successfully.' If the `delete` step works but the `save` step throws an error, Spring catches that error and tells the database to 'rollback'—which instantly undoes the delete. It keeps the data safe."

**Q10: What if the database crashes exactly in the middle of your transaction?**
* **Answer:** "Because I used `@Transactional`, if the database crashes or loses power, it never received the final 'commit' command. So when the database restarts, it automatically throws away the half-finished changes. The old data will still be there, untouched."

**Q11: How did you design the database relationships? For example, how do logs link to a user?**
* **Answer:** "I used JPA relationships. A `User` can upload many `LogFiles`, so that's a `@OneToMany` relationship. A single `LogFile` can contain hundreds of `ParsedLog` entries, so that is also a `@OneToMany` relationship. This makes it easy to delete a file and have all its parsed logs get deleted automatically if I use 'CascadeType.REMOVE'."

---

## 3. Questions on the Regex Log Parser

**Q12: Your regex parser reads line-by-line. What happens if a user uploads a massive 2GB log file? Won't your server run out of memory?**
* **Answer:** "Right now, my code uses `Files.readAllLines()`, which loads the whole file into RAM. For standard files, it's fine. But you're right, a 2GB file would cause an `OutOfMemoryError`. To fix that, I would change my code to use `Files.lines()`, which returns a Java Stream. A stream processes the file chunk-by-chunk instead of loading it all into memory at once."

**Q13: Why did you use Regex instead of just splitting the string by spaces?**
* **Answer:** "Because log files are messy. The date might have a 'T' in it or a space. The message itself has spaces. Regex is much safer because it looks for the exact shape of a timestamp (like YYYY-MM-DD), no matter how the rest of the text is spaced out. Simple splitting would break instantly."

---

## 4. Questions on Gemini AI Integration

**Q14: You added error handling for when the Gemini API is slow or down. But what if it takes 2 minutes to respond? Won't that freeze your user's screen?**
* **Answer:** "Yes, waiting 2 minutes would be a bad user experience. In my `WebClient` setup, I specifically added a timeout limit (like 30 seconds). If Gemini doesn't reply in 30 seconds, my code stops waiting, catches the `TimeoutException`, and immediately tells the user 'AI is taking too long', rather than freezing their screen forever."

**Q15: Why did you use WebClient instead of RestTemplate to call Gemini?**
* **Answer:** "Spring officially recommends `WebClient` now because `RestTemplate` is in maintenance mode. `WebClient` is much more modern, easier to configure with things like timeouts, and allows for non-blocking asynchronous calls if I ever need to make the app much faster later."

**Q16: You said Gemini returns JSON. What happens if the AI makes a mistake and returns bad JSON (like missing a bracket)?**
* **Answer:** "I use the Jackson library (ObjectMapper) to read the JSON. If the JSON is broken, Jackson will throw a `JsonProcessingException`. I catch this exception in my `try-catch` block, and instead of crashing, I return a safe 'Fallback Response' telling the user that the AI couldn't generate a clear answer this time."

---

## 5. Questions on Security & Error Handling

**Q17: You used JWT for authentication. Where exactly does the frontend store this token, and what are the risks?**
* **Answer:** "Usually, the frontend stores it in `localStorage` or a `Secure HttpOnly Cookie`. `localStorage` is easier for a basic React app, but it is vulnerable to XSS (Cross-Site Scripting) attacks if a hacker injects malicious JavaScript. A `Secure HttpOnly Cookie` is much safer because JavaScript cannot read it, making it immune to XSS."

**Q18: What happens if a user’s JWT token expires while they are using the app?**
* **Answer:** "When the token expires, Spring Security will reject their next API call with a 401 Unauthorized status. On the frontend, I would catch that 401 error and automatically redirect the user back to the login page so they can sign in again."

**Q19: How did you store user passwords in the database?**
* **Answer:** "I never store passwords as plain text. I used `BCryptPasswordEncoder` provided by Spring Security. When a user signs up, it scrambles their password into a hash before saving it to the database. Even if someone hacked the database, they wouldn't be able to read the real passwords."

**Q20: If an error happens anywhere in your code (like a file not found), how do you make sure the frontend gets a clean error message instead of a huge Java stack trace?**
* **Answer:** "I used Spring's `@ControllerAdvice` and `@ExceptionHandler`. This acts like a global safety net. If any error happens anywhere in my controllers or services, this class catches it and converts it into a clean, easy-to-read JSON response (like `{'error': 'File not found', 'status': 404}`) before sending it back to React."
