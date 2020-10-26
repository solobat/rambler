import { updateText } from "../../../server/controller/paragraphController";
import { UPDATE_PARAGRAH_TEXT } from "../actionTypes"

const service = {
  update(id, newText) {
    return function(dispatch) {
      return updateText(id, newText)
    }
  }
}
export function updateParagraphText(id, newText) {
  return (dispatch) => {
    return dispatch(service.update(id, newText)).then(() => {
      dispatch({
        type: UPDATE_PARAGRAH_TEXT,
        payload: newText
      });
    });
  }
}