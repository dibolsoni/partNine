# partNine - REST API from Treehouse
This API provides a way for users to administer a school database containing information about courses: users can interact with the database by retrieving a list of courses, as well as adding, updating and deleting courses in the database.

<h3>INSTALL</h3>
<b>Steps:</b> <br />
@ 1 - download files <br />
@ 2 - install dependecies -> npm install <br />
@ 3 - install db -> npm run seed <br />
@ 4 - start project -> npm start <br />

<h3>USAGE</h3>
<ul>
  <li> GET /api/users - status code if ok: 200 - Returns the currently authenticated user </li>
  <li> POST /api/users - status code if ok: 201 - Creates a user, no content returned  </li>
  <li> GET /api/courses - status code if ok: 200 - Returns a list of courses </li>
  <li> GET /api/courses/:id - status code if ok: 200 - Returns a the course for the provided course ID</li>
  <li> POST /api/courses - status code if ok: 201 - Creates a course, no content returned </li>
  <li> PUT /api/courses/:id - status code if ok: 204 - Updates a course, no content returned  </li>
  <li> DELETE /api/courses/:id - status code if ok: 204 - Deletes a course, no content returned </li>
</ul>






