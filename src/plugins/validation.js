export default {
  async install(Vue, options) {
    Vue.prototype.$validation = new Vue({
      data() {
        return {
          validations: [],
        };
      },
      computed: {
        list() {
          return this.validations.map((l) => l.validationIndex);
        },
      },
      created() {
        this.$events.on("route:validation", (validation) => {
          // console.log('validation.js', validation)
          this.hydrate(validation);
        });
      },
      methods: {
        purge(validation) {
          const matched = this.validations.filter(
            (l) => l.validationIndex === Number(validation)
          );
          if (matched) {
            const index = this.validations.indexOf(matched[0]);
            if (index > -1) {
              this.validations.splice(index, 1);
            }
          }
          // TODO: If no validations left: route back home
        },
        getValidation(validation) {
          const validationIndex = Number(validation);
          const matched = this.validations.filter(
            (l) => l.validationIndex === validationIndex
          );
          if (matched) {
            return matched[0]?.validationData;
          } else {
            return this.hydrate(validation);
          }
        },
        async hydrate(validation) {
          const validationIndex = Number(validation);
          if (
            this.validations.filter(
              (l) => l.validationIndex === validationIndex
            ).length > 0
          ) {
            console.log("Skip hydrating: known", validation);
          } else {
            console.log("Hydrate", validation);

            const existingRecordIndex = this.validations
              .map((l) => l.validationIndex)
              .indexOf(validationIndex);
            if (existingRecordIndex < 0) {
              this.validations.push({ validationIndex, validationData: {} });
            }

            const validationData = await this.$ws.send({
              command: "validation",
              validation_index: Number(validation),
              transactions: true,
              expand: true,
            });
            // console.log(validationData)
            Object.assign(
              this.validations[
                this.validations
                  .map((l) => l.validationIndex)
                  .indexOf(validationIndex)
              ],
              {
                validationData,
              }
            );

            console.log("Hydrated", validation);
            return validationData;
          }
        },
      },
    });
  },
};
