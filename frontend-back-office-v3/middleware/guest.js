export default function({ store, redirect }) {
  try {
    if (store.state.auth.loggedIn) {
      return redirect("/");
    }
  } catch (e) {
    console.log(e);
  }
}
