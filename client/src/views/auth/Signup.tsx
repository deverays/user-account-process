/**Vue */
import { defineComponent } from "vue";

/**Utils */
import imports from "../../utils/imports";

/**Components */
import BoxAnimation from "../../components/animations/BoxAnimation";
import {
  Form,
  FormInput,
  FormButton,
  FormParagraph,
} from "../../components/ui/form";

/**Auth */
import {
  validateUsername,
  validateEmail,
  validatePassword,
} from "../../utils/auth/validator";

/**Images */
import defaultAvatar from "../../assets/images/default_avatar.png";

export default defineComponent({
  setup() {
    const { store, router, route, reactive, watchEffect, postReq } = imports();

    const state = reactive({
      errorStatus: 200,
      passwordAgain: "",
      buttonActive: false,
      email: route.query.email || "",
      username: route.query.username || "",
      password: route.query.password || "",
    });

    watchEffect(() => {
      const { email, password, passwordAgain, username } = state;
      const isValue =
        validateEmail(email as string) &&
        validatePassword(password as string) &&
        validatePassword(passwordAgain as string) &&
        validateUsername(username as string);
      state.buttonActive = isValue;
    });

    const onSignup = async () => {
      store._isProgress = 40;
      try {
        await postReq("/auth/signup", {
          email: state.email,
          username: state.username,
          password: state.password,
          passwordAgain: state.passwordAgain,
          avatar: URL.createObjectURL(new Blob([defaultAvatar])),
        });
        store._isProgress = 100;
        router.push({
          path: "/auth/login",
          query: { ref: route.query.ref || "/" },
        });
      } catch (err: any) {
        store._isProgress = 100;
        state.errorStatus = err.response.status;
        setTimeout(() => (state.errorStatus = 200), 5000);
      }
    };

    return { route, state, onSignup };
  },
  render() {
    const { errorStatus, buttonActive } = this.state;
    return (
      <div v-motion-slide-visible-once-right>
        <BoxAnimation class="fixed" />
        <div class="flex justify-center items-center h-dvh w-dvw">
          <Form
            class="md:h-[550px]"
            top={
              <>
                <FormInput
                  errorActive={errorStatus === 409}
                  onChange={(item) => (this.state.username = item)}
                  type="text"
                  label={this.$t("Form.SignupForm.Input.username")}
                />
                <FormInput
                  errorActive={errorStatus === 409}
                  onChange={(item) => (this.state.email = item)}
                  class=""
                  type="email"
                  label="E-mail"
                />
                <FormInput
                  onChange={(item) => (this.state.password = item)}
                  class=""
                  type="password"
                  label={this.$t("Form.SignupForm.Input.password")}
                />
                <FormInput
                  onChange={(item) => (this.state.passwordAgain = item)}
                  type="password"
                  label={this.$t("Form.SignupForm.Input.passwordAgain")}
                />
              </>
            }
            bottom={
              <>
                <FormButton
                  onClick={this.onSignup}
                  class="hover:w-32 mb-5"
                  label={this.$t("Form.SignupForm.Button.signup")}
                  active={buttonActive}
                  icon={
                    <svg
                      class="w-[32px] h-[32px] text-gray-100"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12H19M19 12L13 6M19 12L13 18"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  }
                />
                <FormParagraph to="/auth/login">
                  {this.$t("Form.SignupForm.Button.login")}
                </FormParagraph>
              </>
            }
            title={this.$t("Form.SignupForm.title")}
          />
        </div>
      </div>
    );
  },
});