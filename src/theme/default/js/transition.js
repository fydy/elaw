import Highway from "@dogstudio/highway";
import fade from "./fade";

export default class Transition extends Highway.Transition {
  in(from, to, done) {
    from.remove();
    fade.fadeIn(to, {
        duration: 300,
        complete: done
    })
  }

  out(from, done) {
    fade.fadeOut(from, {
        duration: 150,
        complete: done
    })
  }
}
